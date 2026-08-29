# -*- coding: utf-8 -*-
"""Briques 2D : contours de texte, tracé à la plume, maillage extrudé."""
import math
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
import numpy as np
import mapbox_earcut


class _Pen(BasePen):
    def __init__(self, glyphSet, pas):
        super().__init__(glyphSet)
        self.contours, self.cur, self.pas = [], None, pas

    def _moveTo(self, pt):
        self._fin()
        self.cur = [pt]

    def _lineTo(self, pt):
        self.cur.append(pt)

    def _curveToOne(self, c1, c2, pt):
        p0 = self.cur[-1]
        long = (abs(c1[0]-p0[0]) + abs(c2[0]-c1[0]) + abs(pt[0]-c2[0])
                + abs(c1[1]-p0[1]) + abs(c2[1]-c1[1]) + abs(pt[1]-c2[1]))
        n = max(2, min(48, int(long / self.pas) + 2))
        for i in range(1, n + 1):
            t = i / n
            u = 1 - t
            self.cur.append((
                u**3*p0[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t**3*pt[0],
                u**3*p0[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t**3*pt[1]))

    def _fin(self):
        if self.cur and len(self.cur) >= 3:
            if self.cur[0] == self.cur[-1]:
                self.cur.pop()
            self.contours.append(self.cur)
        self.cur = None

    def _closePath(self):
        self._fin()

    def _endPath(self):
        self._fin()


def hauteur_capitale(tt):
    """Hauteur de capitale en unités de la police."""
    try:
        h = tt["OS/2"].sCapHeight
        if h:
            return h
    except Exception:
        pass
    gs = tt.getGlyphSet()
    pen = _Pen(gs, tt["head"].unitsPerEm / 40)
    gs[tt.getBestCmap()[ord("H")]].draw(pen)
    return max(p[1] for c in pen.contours for p in c)


def glyphes_texte(txt, chemin_police, hauteur, approche=0.0, condense=1.0):
    """Contours signe par signe, avec le milieu de chasse de chacun.

    hauteur   : hauteur des capitales, en mm
    approche  : espacement additionnel entre lettres, en mm
    condense  : facteur d'étirement horizontal (< 1 = plus étroit)
    """
    tt = TTFont(chemin_police)
    upem = tt["head"].unitsPerEm
    k = hauteur / hauteur_capitale(tt)          # unités police -> mm
    gs, cmap, hmtx = tt.getGlyphSet(), tt.getBestCmap(), tt["hmtx"]

    glyphes, x = [], 0.0
    for ch in txt:
        nom = cmap.get(ord(ch))
        if nom is None:
            x += upem * 0.3 * k * condense + approche
            continue
        pen = _Pen(gs, upem / 200)
        gs[nom].draw(pen)
        avance = hmtx[nom][0] * k * condense + approche
        glyphes.append(([[(p[0] * k * condense + x, p[1] * k) for p in c]
                         for c in pen.contours], x + avance / 2))
        x += avance
    return glyphes


def contours_texte(txt, chemin_police, hauteur, approche=0.0, condense=1.0):
    """Contours d'une chaîne, cadrés sur la hauteur de capitale demandée."""
    return [c for contours, _ in
            glyphes_texte(txt, chemin_police, hauteur, approche, condense)
            for c in contours]


# ------------------------------------------------------------------ plume

def _bezier(p0, p1, p2, p3, n):
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        yield (u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
               u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1])


def echantillonner(courbes, n=60):
    """Suite de points à partir d'une liste de cubiques enchaînées."""
    pts = []
    for c in courbes:
        seg = list(_bezier(*c, n))
        pts.extend(seg[1:] if pts else seg)
    return pts


def epaissir(lignes, largeur):
    """Épaissit des lignes médianes et fusionne les recoupements.

    Renvoie des groupes (extérieur, [trous]) prêts à mailler.
    """
    from shapely.geometry import LineString
    from shapely.ops import unary_union
    polys = [LineString(l).buffer(largeur / 2, cap_style="round",
                                  join_style="round", quad_segs=8)
             for l in lignes if len(l) >= 2]
    return _groupes_shapely(unary_union(polys))


# ------------------------------------------------------- imbrication/maillage

def _aire(c):
    s = 0.0
    for (x1, y1), (x2, y2) in zip(c, c[1:] + c[:1]):
        s += x1 * y2 - x2 * y1
    return s / 2


def _dedans(pt, c):
    x, y = pt
    d = False
    for (x1, y1), (x2, y2) in zip(c, c[1:] + c[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            d = not d
    return d


def grouper(contours):
    """Range des contours en (extérieur, [trous]) par profondeur d'imbrication."""
    aires = [abs(_aire(c)) for c in contours]
    prof = []
    for i, c in enumerate(contours):
        prof.append(sum(1 for j, o in enumerate(contours)
                        if j != i and aires[j] > aires[i] and _dedans(c[0], o)))
    groupes = []
    for i, c in enumerate(contours):
        if prof[i] % 2:
            continue
        trous = [o for j, o in enumerate(contours)
                 if prof[j] == prof[i] + 1 and _dedans(o[0], c)]
        groupes.append((c, trous))
    return groupes


def _groupes_shapely(geom):
    out = []
    for g in (geom.geoms if hasattr(geom, "geoms") else [geom]):
        if g.is_empty:
            continue
        out.append((list(g.exterior.coords)[:-1],
                    [list(r.coords)[:-1] for r in g.interiors]))
    return out


def assainir(contours):
    """Nettoie et fusionne des contours (lettres qui se chevauchent, etc.)."""
    from shapely.geometry import Polygon
    from shapely.ops import unary_union
    polys = [Polygon(e, t).buffer(0) for e, t in grouper(contours)]
    return _groupes_shapely(unary_union(polys))


def mailler(groupes, z0, z1):
    """Extrude des groupes (extérieur, trous) en maillage fermé."""
    V, T = [], []
    for ext, trous in groupes:
        ext = ext if _aire(ext) > 0 else ext[::-1]                 # anti-horaire
        trous = [t if _aire(t) < 0 else t[::-1] for t in trous]    # horaire

        anneaux = [ext] + trous
        plat = [p for a in anneaux for p in a]
        bornes, acc = [], 0
        for a in anneaux:
            acc += len(a)
            bornes.append(acc)
        idx = mapbox_earcut.triangulate_float64(
            np.array(plat, dtype=np.float64), np.array(bornes, dtype=np.uint32))

        base = len(V)
        V.extend((p[0], p[1], z1) for p in plat)            # dessus
        V.extend((p[0], p[1], z0) for p in plat)            # dessous
        h = base + len(plat)
        for i in range(0, len(idx), 3):
            a, b, c = int(idx[i]), int(idx[i+1]), int(idx[i+2])
            ax, ay = plat[a]; bx, by = plat[b]; cx, cy = plat[c]
            if (bx-ax)*(cy-ay) - (by-ay)*(cx-ax) < 0:       # dessus anti-horaire
                b, c = c, b
            T.append((base+a, base+b, base+c))
            T.append((h+a, h+c, h+b))
        d = 0
        for a in anneaux:                                   # flancs
            m = len(a)
            for i in range(m):
                p, q = d + i, d + (i + 1) % m
                T.append((base + p, h + q, base + q))
                T.append((base + p, h + p, h + q))
            d += m
    return V, T


def verifier(V, T):
    """Contrôle que le maillage est fermé et orienté ; renvoie (fermé, volume)."""
    aretes = {}
    for a, b, c in T:
        for e in ((a, b), (b, c), (c, a)):
            aretes[e] = aretes.get(e, 0) + 1
    ferme = all(aretes.get((b, a), 0) == n for (a, b), n in aretes.items())
    vol = 0.0
    for a, b, c in T:
        p, q, r = V[a], V[b], V[c]
        vol += (p[0]*(q[1]*r[2]-r[1]*q[2]) - q[0]*(p[1]*r[2]-r[1]*p[2])
                + r[0]*(p[1]*q[2]-q[1]*p[2])) / 6
    return ferme, vol


def contours_du_dessus(V, T, eps=1e-6):
    """Contours de la face supérieure d'un maillage extrudé.

    Sert à récupérer le dessin d'une pièce qu'on ne régénère pas (le numéro
    d'origine, par exemple) pour le réécrire dans le SVG associé.
    """
    zmax = max(v[2] for v in V)
    cle, idx = {}, []
    for v in V:
        k = (round(v[0], 6), round(v[1], 6), round(v[2], 6))
        idx.append(cle.setdefault(k, len(cle)))
    pts = [None] * len(cle)
    for v, i in zip(V, idx):
        pts[i] = (v[0], v[1])

    aretes = set()
    for a, b, c in T:
        if not all(abs(V[k][2] - zmax) < eps for k in (a, b, c)):
            continue
        for e in ((idx[a], idx[b]), (idx[b], idx[c]), (idx[c], idx[a])):
            aretes.add(e)
    suivant = {a: b for a, b in aretes if (b, a) not in aretes}

    contours = []
    while suivant:
        depart = next(iter(suivant))
        anneau = [depart]
        cur = suivant.pop(depart)
        while cur != depart:
            anneau.append(cur)
            cur = suivant.pop(cur, None)
            if cur is None:
                break
        if len(anneau) >= 3:
            contours.append([pts[i] for i in anneau])
    return contours


# ---------------------------------------------------------------- arc de nom

def ajuster_arc(points):
    """Ajuste un cercle sur des points ; renvoie (cx, cy, rayon) ou None.

    Sert à retrouver la courbure d'un nom floqué en arc de cercle. Renvoie
    None si les points sont alignés (nom droit) : le cercle dégénère alors en
    droite et son rayon part à l'infini.
    """
    if len(points) < 3:
        return None
    n = len(points)
    sx = sum(p[0] for p in points); sy = sum(p[1] for p in points)
    sxx = sum(p[0]**2 for p in points); syy = sum(p[1]**2 for p in points)
    sxy = sum(p[0]*p[1] for p in points)
    sxz = sum(p[0]*(p[0]**2 + p[1]**2) for p in points)
    syz = sum(p[1]*(p[0]**2 + p[1]**2) for p in points)
    sz = sum(p[0]**2 + p[1]**2 for p in points)
    # système normal de l'ajustement algébrique x^2+y^2 + a x + b y + c = 0
    A = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]]
    B = [-sxz, -syz, -sz]
    det = (A[0][0]*(A[1][1]*A[2][2] - A[1][2]*A[2][1])
           - A[0][1]*(A[1][0]*A[2][2] - A[1][2]*A[2][0])
           + A[0][2]*(A[1][0]*A[2][1] - A[1][1]*A[2][0]))
    if abs(det) < 1e-12:
        return None
    def remplace(k):
        M = [ligne[:] for ligne in A]
        for i in range(3):
            M[i][k] = B[i]
        return (M[0][0]*(M[1][1]*M[2][2] - M[1][2]*M[2][1])
                - M[0][1]*(M[1][0]*M[2][2] - M[1][2]*M[2][0])
                + M[0][2]*(M[1][0]*M[2][1] - M[1][1]*M[2][0])) / det
    a, b, c = remplace(0), remplace(1), remplace(2)
    cx, cy = -a / 2, -b / 2
    r2 = cx*cx + cy*cy - c
    if r2 <= 0:
        return None
    return cx, cy, math.sqrt(r2)


def cintrer_glyphes(glyphes, rayon, y_base, x_centre):
    """Pose chaque signe sur un arc de cercle en le faisant pivoter d'un bloc.

    Une déformation point par point ferait s'écarter le haut des lettres vers
    l'extérieur et élargirait le mot ; un flocage cintré, lui, garde des
    lettres intactes, simplement inclinées le long de l'arc.

    `y_base` est la ligne de base au sommet de l'arc, `x_centre` son abscisse.
    Un rayon positif creuse l'arc vers le haut, lettres extérieures plus basses.
    """
    if not rayon:
        return [c for contours, _ in glyphes for c in contours]
    cy = y_base - rayon
    sortie = []
    for contours, xg in glyphes:
        theta = (xg - x_centre) / rayon
        bx = x_centre + rayon * math.sin(theta)
        by = cy + rayon * math.cos(theta)
        co, si = math.cos(theta), math.sin(theta)
        for c in contours:
            sortie.append([(bx + (p[0] - xg) * co + (p[1] - y_base) * si,
                            by - (p[0] - xg) * si + (p[1] - y_base) * co)
                           for p in c])
    return sortie
