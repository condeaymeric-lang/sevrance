#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Personnalise un cadre maillot 3MF (projet Bambu Studio) : nom, numéro, signature.

Ces projets rangent chaque élément dans une pièce séparée — le maillot, les
rayures, le flocage au dos, chaque ligne de la plaque, la signature. Le script
ne réécrit donc que les maillages concernés : tout le reste du projet, réglages
d'impression, affectation des filaments, positions, plaques du cadre, est
recopié à l'octet près.

Rien n'est codé en dur, ni les identifiants de pièces ni les millimètres :
le script repère les pièces d'après leur place dans le cadre (`reperer`) et
mesure la géométrie d'origine pour caler la nouvelle dessus. Il accepte aussi
bien les projets d'un seul tenant que ceux dont les maillages sont éclatés
dans `3D/Objects/*.model`.

La signature produite est une écriture inventée, fabriquée trait par trait
par `signature_manuscrite` : elle ne reproduit l'autographe de personne.

Dépendances :  pip install -r tools/requirements.txt
Utilisation :  python tools/personnaliser_maillot.py source.3mf sortie.3mf --nom TATIN
"""
import argparse
import math
import os
import re
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import geometrie2d as g2
import signature_manuscrite as sigm

# =========================================================================
#  PARAMÈTRES
# =========================================================================

NOM_MAILLOT = "DURAND"      # floqué au dos du maillot
NUMERO = None               # None = on garde le numéro d'origine ; sinon "9", "23"...

PLAQUE_LIGNE_1 = ""         # prénom ; vide = une seule ligne, recentrée
PLAQUE_LIGNE_2 = ""         # nom ; vide = on reprend le nom du maillot

SIGNATURE = ""              # None = dérivé du nom ; "" = pas de signature
SIGNATURE_GRAINE = 7        # change le tracé sans changer le nom
SIGNATURE_ALEA = 0.030      # ampleur de l'ondulation de la main
TRAIT_SIGNATURE = 0.46      # largeur du trait, en mm

# Polices. Celles des maillots sont des caractères de club, non
# redistribuables. Barlow en est l'équivalent libre le plus proche ; les
# maillots utilisent tantôt une chasse étroite, tantôt une chasse normale, et
# le script retient celle qui tombe le plus près du flocage d'origine.
POLICES_MAILLOT = {
    "BarlowCondensed-SemiBold.ttf":
        "https://raw.githubusercontent.com/google/fonts/main/"
        "ofl/barlowcondensed/BarlowCondensed-SemiBold.ttf",
    "Barlow-SemiBold.ttf":
        "https://raw.githubusercontent.com/google/fonts/main/"
        "ofl/barlow/Barlow-SemiBold.ttf",
}
POLICE_PLAQUE = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

# Liserés du maillot : distances au bord, en mm. Le premier suit toute la
# silhouette, les suivants ne longent que les épaules, les manches et le col.
# Les bandes et les intervalles restent au-dessus de 0,6 mm pour passer
# proprement avec une buse de 0,4.
LISERES = [(0.0, 1.0), (1.6, 2.9), (3.5, 4.8)]

RACINE = "3D/3dmodel.model"


# =========================================================================
#  LE PROJET 3MF
# =========================================================================

class Projet:
    """Accès uniforme aux maillages d'un projet Bambu.

    Les projets récents éclatent les maillages dans `3D/Objects/*.model` et ne
    gardent dans `3D/3dmodel.model` que l'assemblage. Cette classe masque la
    différence : on demande un objet par son identifiant, sans savoir où il est.
    """

    def __init__(self, chemin):
        with zipfile.ZipFile(chemin) as z:
            self.fichiers = {i.filename: z.read(i.filename) for i in z.infolist()}
        self.ordre = list(self.fichiers)
        self.modeles = {f: d.decode("utf-8") for f, d in self.fichiers.items()
                        if f.endswith(".model")}
        self.cfg = self.fichiers["Metadata/model_settings.config"].decode("utf-8")

        # assemblage = l'objet qui rassemble le plus de composants
        self.assemblage, self.composants = None, {}
        for m in re.finditer(r'<object id="(\d+)"[^>]*>\s*<components>(.*?)</components>',
                             self.modeles[RACINE], re.S):
            trouves = re.findall(
                r'<component (?:p:path="([^"]*)" )?objectid="(\d+)"[^>]*'
                r'transform="([^"]*)"', m.group(2))
            if len(trouves) > len(self.composants):
                self.assemblage = int(m.group(1))
                self.composants = {int(o): [float(x) for x in t.split()]
                                   for _, o, t in trouves}

        # où vit le maillage de chaque objet
        self.emplacement = {}
        for f, s in self.modeles.items():
            for m in re.finditer(r'<object id="(\d+)"[^>]*>\s*<mesh>', s):
                self.emplacement[int(m.group(1))] = f

    # ------------------------------------------------------------- maillages
    def _bloc(self, oid):
        f = self.emplacement[oid]
        s = self.modeles[f]
        i = re.search(rf'<object id="{oid}"[^>]*>', s).start()
        j = s.index("</object>", i) + len("</object>")
        return f, i, j

    def maillage(self, oid):
        f, i, j = self._bloc(oid)
        seg = self.modeles[f][i:j]
        V = [(float(a), float(b), float(c)) for a, b, c in
             re.findall(r'<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"/>', seg)]
        T = [(int(a), int(b), int(c)) for a, b, c in
             re.findall(r'<triangle v1="([^"]+)" v2="([^"]+)" v3="([^"]+)"', seg)]
        return V, T

    def remplacer(self, oid, V, T):
        """Remplace le maillage d'un objet en gardant sa balise d'origine."""
        f, i, j = self._bloc(oid)
        seg = self.modeles[f][i:j]
        v = "".join(f'     <vertex x="{x:.9g}" y="{y:.9g}" z="{z:.9g}"/>\n'
                    for x, y, z in V)
        t = "".join(f'     <triangle v1="{a}" v2="{b}" v3="{c}"/>\n' for a, b, c in T)
        neuf = re.sub(r"<mesh>.*</mesh>",
                      f"<mesh>\n    <vertices>\n{v}    </vertices>\n"
                      f"    <triangles>\n{t}    </triangles>\n   </mesh>",
                      seg, flags=re.S)
        self.modeles[f] = self.modeles[f][:i] + neuf + self.modeles[f][j:]

    def supprimer(self, oid):
        """Retire un objet : son maillage, son composant et sa pièce du config."""
        f, i, j = self._bloc(oid)
        s = self.modeles[f]
        while i > 0 and s[i - 1] in " \t":
            i -= 1
        if i > 0 and s[i - 1] == "\n":
            i -= 1
        self.modeles[f] = s[:i] + s[j:]
        self.modeles[RACINE] = re.sub(
            rf'\n *<component [^>]*objectid="{oid}"[^>]*/>', "", self.modeles[RACINE])
        self.composants.pop(oid, None)
        self.emplacement.pop(oid, None)

    # ------------------------------------------------------- transformations
    def transformation(self, oid):
        return self.composants[oid]

    def vers_monde(self, oid, p):
        v = self.composants[oid]
        return (v[0] * p[0] + v[3] * p[1] + v[9],
                v[1] * p[0] + v[4] * p[1] + v[10])

    def vers_local(self, oid, p):
        v = self.composants[oid]
        det = v[0] * v[4] - v[3] * v[1]
        x, y = p[0] - v[9], p[1] - v[10]
        return ((v[4] * x - v[3] * y) / det, (-v[1] * x + v[0] * y) / det)

    def echelle(self, oid):
        """Facteur d'agrandissement du composant (norme de ses colonnes)."""
        v = self.composants[oid]
        return ((v[0] ** 2 + v[1] ** 2) ** 0.5, (v[3] ** 2 + v[4] ** 2) ** 0.5)

    def boite_monde(self, oid):
        V, T = self.maillage(oid)
        pts = [self.vers_monde(oid, v) for v in V]
        return (min(p[0] for p in pts), max(p[0] for p in pts),
                min(p[1] for p in pts), max(p[1] for p in pts))

    # ------------------------------------------------------- ajout de pièces
    def ajouter(self, nom, V, T, extrudeur):
        """Ajoute une pièce à l'assemblage : maillage, composant et réglages.

        Le maillage est donné dans le repère de l'assemblage ; le composant
        reçoit donc une transformation identité. Le maillage est contrôlé
        avant d'être écrit : une pièce ouverte ne doit pas partir au découpage.
        """
        import uuid
        ferme, volume = g2.verifier(V, T)
        if not ferme or volume <= 0:
            raise SystemExit(f"pièce « {nom} » : maillage non fermé "
                             f"(volume {volume:.3f}), rien n'a été écrit")
        ids = [int(i) for i in re.findall(r'<object id="(\d+)"', "".join(self.modeles.values()))]
        oid = max(ids) + 1
        fichier = max(set(self.emplacement.values()),
                      key=list(self.emplacement.values()).count)
        s = self.modeles[fichier]

        v = "".join(f'     <vertex x="{x:.9g}" y="{y:.9g}" z="{z:.9g}"/>\n' for x, y, z in V)
        t = "".join(f'     <triangle v1="{a}" v2="{b}" v3="{c}"/>\n' for a, b, c in T)
        uid = f' p:UUID="{uuid.uuid4()}"' if 'p:UUID' in s else ""
        objet = (f'  <object id="{oid}"{uid} type="model">\n   <mesh>\n'
                 f'    <vertices>\n{v}    </vertices>\n'
                 f'    <triangles>\n{t}    </triangles>\n   </mesh>\n  </object>\n')
        i = s.rindex("</resources>")
        self.modeles[fichier] = s[:i] + objet + s[i:]
        self.emplacement[oid] = fichier

        # composant, calqué sur la forme de ceux déjà présents
        racine = self.modeles[RACINE]
        j = re.search(rf'<object id="{self.assemblage}"[^>]*>', racine).end()
        k = racine.index("</components>", j)
        modele_comp = re.findall(r'<component [^>]*/>', racine[j:k])[-1]
        chemin_p = re.search(r'p:path="([^"]*)"', modele_comp)
        uid_c = f' p:UUID="{uuid.uuid4()}"' if "p:UUID" in modele_comp else ""
        comp = ('\n    <component'
                + (f' p:path="{chemin_p.group(1)}"' if chemin_p else "")
                + f' objectid="{oid}"{uid_c}'
                ' transform="1 0 0 0 1 0 0 0 1 0 0 0" />')
        self.modeles[RACINE] = racine[:k] + comp + "\n   " + racine[k:]
        self.composants[oid] = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]

        # entrée dans model_settings.config, insérée après la dernière pièce
        i = self.cfg.index(f'<object id="{self.assemblage}">')
        fin = self.cfg.rindex("</part>", i, self.cfg.index("</object>", i)) + len("</part>")
        piece = (f'\n    <part id="{oid}" subtype="normal_part">\n'
                 f'      <metadata key="name" value="{echapper(nom)}"/>\n'
                 f'      <metadata key="matrix" value="1 0 0 0 1 0 0 0 1 0 0 0 0 0 0 1"/>\n'
                 f'      <metadata key="extruder" value="{extrudeur}"/>\n'
                 f'      <mesh_stat face_count="{len(T)}" edges_fixed="0"'
                 ' degenerate_facets="0" facets_removed="0" facets_reversed="0"'
                 ' backwards_edges="0"/>\n    </part>')
        self.cfg = self.cfg[:fin] + piece + self.cfg[fin:]
        return oid

    # ---------------------------------------------------------- enregistrement
    def enregistrer(self, chemin):
        for f, s in self.modeles.items():
            self.fichiers[f] = s.encode("utf-8")
        self.fichiers["Metadata/model_settings.config"] = self.cfg.encode("utf-8")
        with zipfile.ZipFile(chemin, "w", zipfile.ZIP_DEFLATED) as z:
            for nom in self.ordre:
                if nom in self.fichiers:
                    z.writestr(nom, self.fichiers[nom])
            for nom in self.fichiers:
                if nom not in self.ordre:
                    z.writestr(nom, self.fichiers[nom])


# =========================================================================
#  RÉGLAGES DU PROJET (Metadata/model_settings.config)
# =========================================================================

def bloc_piece(cfg, pid):
    i = re.search(rf'<part id="{pid}"', cfg).start()
    j = cfg.index("</part>", i) + len("</part>")
    return i, j


def lire_piece(cfg, pid):
    """Nom, extrudeur, texte et SVG d'une pièce."""
    i, j = bloc_piece(cfg, pid)
    seg = cfg[i:j]
    nom = re.search(r'<metadata key="name" value="([^"]*)"', seg)
    txt = re.search(r'<text_info text="([^"]*)"', seg)
    svg = re.search(r'filepath3mf="([^"]*)"', seg)
    return {"nom": nom.group(1) if nom else "",
            "texte": txt.group(1) if txt else None,
            "svg": svg.group(1) if svg else None}


def modifier_piece(cfg, pid, **valeurs):
    i, j = bloc_piece(cfg, pid)
    seg = cfg[i:j]
    if "nom" in valeurs:
        seg = re.sub(r'(<metadata key="name" value=")[^"]*(")',
                     lambda m: m.group(1) + echapper(valeurs["nom"]) + m.group(2),
                     seg, count=1)
    if "texte" in valeurs:
        seg = re.sub(r'(<text_info text=")[^"]*(")',
                     lambda m: m.group(1) + echapper(valeurs["texte"]) + m.group(2),
                     seg, count=1)
    if "faces" in valeurs:
        seg = re.sub(r'(<mesh_stat face_count=")\d+(")',
                     lambda m: m.group(1) + str(valeurs["faces"]) + m.group(2),
                     seg, count=1)
    if "extrudeur" in valeurs:
        seg = re.sub(r'(<metadata key="extruder" value=")\d+(")',
                     lambda m: m.group(1) + str(valeurs["extrudeur"]) + m.group(2), seg)
    if "svg" in valeurs:
        avant, apres = valeurs["svg"]
        seg = seg.replace(f'filepath="{os.path.basename(avant)}"',
                          f'filepath="{os.path.basename(apres)}"')
        seg = seg.replace(f'filepath3mf="{avant}"', f'filepath3mf="{apres}"')
    return cfg[:i] + seg + cfg[j:]


def supprimer_piece(cfg, pid):
    i, j = bloc_piece(cfg, pid)
    while i > 0 and cfg[i - 1] in " \t":
        i -= 1
    if i > 0 and cfg[i - 1] == "\n":
        i -= 1
    return cfg[:i] + cfg[j:]


def echapper(txt):
    return (txt.replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


# =========================================================================
#  MAILLAGES : découpage, mesure, recollage
# =========================================================================

def composantes(V, T):
    """Sépare un maillage en morceaux qui ne se touchent pas (une lettre, un chiffre)."""
    parent = list(range(len(V)))

    def cherche(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for a, b, c in T:
        for x, y in ((a, b), (b, c)):
            ra, rb = cherche(x), cherche(y)
            if ra != rb:
                parent[ra] = rb
    paquets = {}
    for t in T:
        paquets.setdefault(cherche(t[0]), []).append(t)
    return list(paquets.values())


def boite(V, T):
    pts = [V[k] for t in T for k in t]
    return (min(p[0] for p in pts), max(p[0] for p in pts),
            min(p[1] for p in pts), max(p[1] for p in pts),
            min(p[2] for p in pts), max(p[2] for p in pts))


def mediane(valeurs):
    v = sorted(valeurs)
    return v[len(v) // 2]


def gabarit_texte(V, T, arc=False):
    """Ligne de base, hauteur de capitale, courbure et cadrage d'un texte maillé.

    Sur un texte droit, la hauteur retenue est la médiane des sommets de
    lettres : un accent ou un point isolé ne fausse donc pas la mesure.

    Sur un texte cintré (`arc`), les lettres sont inclinées, ce qui gonfle leur
    boîte : on ajuste alors un cercle sur les pieds de lettres et on mesure la
    capitale sur la lettre du sommet, la seule qui soit encore d'aplomb.
    """
    boites = [boite(V, m) for m in composantes(V, T)]
    g = {"base": min(b[2] for b in boites),
         "capitale": mediane([b[3] for b in boites]) - min(b[2] for b in boites),
         "x0": min(b[0] for b in boites), "x1": max(b[1] for b in boites),
         "z0": min(b[4] for b in boites), "z1": max(b[5] for b in boites),
         "rayon": None, "mesure": "boite"}
    g["largeur"] = g["x1"] - g["x0"]
    if not arc or len(boites) < 3:
        return g

    # Seules les vraies lettres servent à l'ajustement : un accent ou un point
    # posé au-dessus du mot est un morceau court, et son pied n'est pas sur la
    # ligne de base. Le laisser passer suffit à inventer une courbure.
    hauteurs = [b[3] - b[2] for b in boites]
    seuil = 0.6 * mediane(hauteurs)
    lettres = [b for b, h in zip(boites, hauteurs) if h >= seuil]
    if len(lettres) < 3:
        return g
    # L'ajustement porte sur le CENTRE de chaque lettre, pas sur son pied :
    # une lettre inclinée a son coin inférieur plus bas que sa ligne de base,
    # et d'autant plus bas qu'elle est loin du sommet — ajuster sur les pieds
    # creuse l'arc. Le centre d'une lettre, lui, est insensible à la rotation.
    centres = [((b[0] + b[1]) / 2, (b[2] + b[3]) / 2) for b in lettres]
    largeur = g["x1"] - g["x0"]
    cercle = g2.ajuster_arc(centres)
    if cercle is None:
        return g
    cx, cy, rayon_c = cercle
    # capitale mesurée sur la lettre du sommet, la seule encore d'aplomb
    haut = min(lettres, key=lambda b: abs((b[0] + b[1]) / 2 - cx))
    cap = haut[3] - haut[2]
    rayon = rayon_c - cap / 2                      # cercle de la ligne de base
    sommet = cy + rayon_c - cap / 2
    creux = (cy + rayon_c) - min(q[1] for q in centres)
    if rayon <= 0 or rayon > 20 * largeur or creux < 0.15 * cap:
        return g                                   # courbure négligeable
    g["rayon"] = rayon
    g["base"] = sommet
    g["centre"] = cx
    g["capitale"] = cap
    # Chasse mesurée d'entraxe à entraxe : la boîte du mot déborde des lettres
    # extrêmes, qui sont inclinées, alors que leurs centres sont sûrs.
    angles = [math.asin(max(-1.0, min(1.0, (q[0] - cx) / rayon_c))) for q in centres]
    g["largeur"] = rayon * (max(angles) - min(angles))
    g["mesure"] = "entraxe"
    return g


def vide_vertical(V, T):
    """Plus grand intervalle en Y où le maillage est absent : (hauteur, altitude)."""
    bandes = sorted((b[2], b[3]) for b in (boite(V, m) for m in composantes(V, T)))
    vide, seuil, haut = 0.0, bandes[0][0] - 1.0, bandes[0][1]
    for y0, y1 in bandes[1:]:
        if y0 - haut > vide:
            vide, seuil = y0 - haut, (y0 + haut) / 2
        haut = max(haut, y1)
    return vide, seuil


def couper_en_deux(V, T):
    """Coupe un maillage de part et d'autre de son plus grand vide horizontal."""
    _, seuil = vide_vertical(V, T)
    morceaux = [(m, boite(V, m)) for m in composantes(V, T)]
    return ([t for m, b in morceaux if b[2] > seuil for t in m],
            [t for m, b in morceaux if b[2] <= seuil for t in m])


def recoller(V, T):
    """Renumérote un sous-ensemble de triangles sur ses seuls sommets."""
    vus, V2, T2 = {}, [], []
    for tri in T:
        n = []
        for k in tri:
            if k not in vus:
                vus[k] = len(V2)
                V2.append(V[k])
            n.append(vus[k])
        T2.append(tuple(n))
    return V2, T2


def fusionner(a, b):
    (Va, Ta), (Vb, Tb) = a, b
    d = len(Va)
    return Va + Vb, Ta + [(x + d, y + d, z + d) for x, y, z in Tb]


# =========================================================================
#  REPÉRAGE DES PIÈCES
# =========================================================================

def reperer(projet):
    """Retrouve les pièces à modifier d'après leur place dans le cadre.

    Aucun identifiant n'est supposé : d'un modèle à l'autre ils changent.
    - le fond et le maillot sont les deux plus grandes pièces ;
    - la plaque et la signature sont sous le maillot, en bas du cadre ;
    - le flocage est la pièce posée sur le maillot dont le maillage présente
      le plus grand vide horizontal, celui qui sépare le nom du numéro.
    """
    boites = {oid: projet.boite_monde(oid) for oid in projet.composants}
    aire = lambda b: (b[1] - b[0]) * (b[3] - b[2])
    classement = sorted(boites, key=lambda o: -aire(boites[o]))
    fond, maillot = classement[0], classement[1]
    bm = boites[maillot]

    def sur_le_maillot(b, marge=1.0):
        return (b[0] >= bm[0] - marge and b[1] <= bm[1] + marge
                and b[2] >= bm[2] - marge and b[3] <= bm[3] + marge)

    dessous, dessus = [], []
    for oid, b in boites.items():
        if oid in (fond, maillot):
            continue
        if sur_le_maillot(b):
            dessus.append(oid)
        elif b[3] < 0:
            dessous.append(oid)

    textes = {oid: lire_piece(projet.cfg, oid)["texte"] for oid in boites}
    plaque = sorted((o for o in dessous if textes[o] is not None),
                    key=lambda o: -boites[o][3])
    signature = sorted((o for o in dessous if textes[o] is None),
                       key=lambda o: -aire(boites[o]))
    # le nom du club est le texte du haut du cadre, au-dessus du maillot
    club = [o for o, t in textes.items()
            if t is not None and o not in (fond, maillot) and boites[o][2] > bm[3]]

    # Le flocage est de loin la pièce la plus détaillée posée sur le maillot :
    # les rayures et liserés ne font que quelques dizaines de triangles.
    flocage = max(dessus, key=lambda o: len(projet.maillage(o)[1])) if dessus else None
    return {"fond": fond, "maillot": maillot, "flocage": flocage,
            "plaque": plaque, "signature": signature[0] if signature else None,
            "club": club[0] if club else None}


# =========================================================================
#  SVG (pour que la pièce reste modifiable dans Bambu Studio)
# =========================================================================

PT = 25.4 / 72.0      # Bambu importe les SVG en points PostScript


def ecrire_svg(groupes):
    """Écrit des contours (en mm) dans un SVG que Bambu réimportera à l'échelle."""
    pts = [p for e, t in groupes for p in e]
    x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
    y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
    L, H = (x1 - x0) / PT, (y1 - y0) / PT

    chemins = []
    for ext, trous in groupes:
        d = []
        for anneau in [ext] + trous:
            c = [("M" if i == 0 else "L")
                 + f"{(p[0]-x0)/PT:.3f} {(y1-p[1])/PT:.3f}"
                 for i, p in enumerate(anneau)]
            d.append(" ".join(c) + " Z")
        chemins.append('<path d="%s"/>' % " ".join(d))

    return ('<?xml version="1.0" standalone="no"?>\n'
            '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"\n'
            f' width="{L:.6f}pt" height="{H:.6f}pt"'
            f' viewBox="0 0 {L:.6f} {H:.6f}">\n'
            '<g fill="#000000" fill-rule="evenodd" stroke="none">\n'
            + "\n".join(chemins) + "\n</g>\n</svg>\n").encode("utf-8")


# =========================================================================
#  TEXTE
# =========================================================================

def police(nom, url=None):
    """Chemin d'une police ; la télécharge au besoin."""
    if os.path.isabs(nom) and os.path.exists(nom):
        return nom
    dossier = os.path.join(os.path.dirname(os.path.abspath(__file__)), "polices")
    chemin = os.path.join(dossier, nom)
    if not os.path.exists(chemin) and url:
        os.makedirs(dossier, exist_ok=True)
        import urllib.request
        print(f"  téléchargement de {nom}...")
        urllib.request.urlretrieve(url, chemin)
    return chemin


def choisir_police(txt_origine, capitale, largeur_cible, mesure="boite"):
    """Police de substitution dont la chasse naturelle colle le mieux à l'originale.

    Renvoie (chemin, resserrement). Un maillot au flocage étroit et un maillot
    au flocage large ne demandent pas la même police : plutôt que d'étirer une
    police unique, on prend celle qui exige la correction la plus faible.
    """
    essais = []
    for nom, url in POLICES_MAILLOT.items():
        chemin = police(nom, url)
        k = calibrer(txt_origine, chemin, capitale, largeur_cible, mesure)
        essais.append((abs(math.log(k)) if k > 0 else 9e9, chemin, k))
    _, chemin, k = min(essais)
    return chemin, k


def calibrer(txt_origine, police, capitale, largeur_cible, mesure="boite"):
    """Resserrement à appliquer pour retrouver la chasse du texte d'origine.

    Les polices des maillots et des plaques ne sont pas redistribuables ; on
    leur substitue un équivalent libre, forcément un peu plus large ou plus
    étroit. Plutôt qu'un facteur réglé à la main, on redessine le texte
    d'origine dans la police de remplacement et on compare les largeurs.

    `mesure` dit sur quoi comparer : la boîte du mot entier, ou l'entraxe des
    lettres extrêmes quand le mot d'origine est cintré et que sa boîte déborde.
    """
    if not txt_origine or not largeur_cible:
        return 1.0
    glyphes = g2.glyphes_texte(txt_origine, police, capitale)
    if not glyphes:
        return 1.0
    if mesure == "entraxe":
        milieux = [(min(q[0] for c in cs for q in c)
                    + max(q[0] for c in cs for q in c)) / 2 for cs, _ in glyphes]
        largeur = max(milieux) - min(milieux)
    else:
        xs = [q[0] for cs, _ in glyphes for c in cs for q in c]
        largeur = max(xs) - min(xs)
    return largeur_cible / largeur if largeur > 0 else 1.0


def texte_cadre(txt, police, capitale, base, centre_x=None, gauche_x=None,
                condense=1.0, rayon=None):
    """Contours d'un texte posé sur une ligne de base, centré ou aligné à gauche.

    Avec un `rayon`, le texte est cintré : chaque lettre pivote d'un bloc le
    long de l'arc, elle n'est pas déformée.
    """
    glyphes = g2.glyphes_texte(txt, police, capitale, condense=condense)
    if not glyphes:
        return []
    xs = [q[0] for cs, _ in glyphes for c in cs for q in c]
    dx = (centre_x - (min(xs) + max(xs)) / 2) if centre_x is not None \
        else (gauche_x - min(xs))
    glyphes = [([[(q[0] + dx, q[1] + base) for q in c] for c in cs], x + dx)
               for cs, x in glyphes]
    return g2.assainir(
        g2.cintrer_glyphes(glyphes, rayon, base, centre_x if rayon else 0.0))


# =========================================================================
#  HABILLAGE DU MAILLOT
# =========================================================================

def bord_superieur(contour):
    """Portion du contour qui va d'une pointe de manche à l'autre par le haut.

    C'est la ligne que suivent les liserés d'épaule d'un maillot : elle
    contourne aussi l'encolure, ce qui dessine le col au passage.
    """
    c = contour if g2._aire(contour) > 0 else contour[::-1]
    n = len(c)
    i_g = min(range(n), key=lambda i: c[i][0])
    i_d = max(range(n), key=lambda i: c[i][0])
    a, b = (i_d, i_g) if i_d < i_g else (i_g, i_d)
    dedans, dehors = c[a:b + 1], c[b:] + c[:a + 1]
    return max(dedans, dehors, key=lambda r: max(q[1] for q in r))


def liseres(contour, largeurs):
    """Découpe le pourtour du maillot en bandes parallèles au bord.

    `largeurs` est une liste de couples (début, fin) mesurés depuis le bord :
    la première bande suit toute la silhouette, les suivantes ne longent que
    le bord supérieur — épaules, manches et encolure.
    """
    from shapely.geometry import Polygon, LineString
    poly = Polygon(contour).buffer(0)
    haut = LineString(bord_superieur(contour))
    bandes = []
    for i, (d0, d1) in enumerate(largeurs):
        if i == 0:
            forme = poly.difference(poly.buffer(-(d1 - d0)))
        else:
            large = haut.buffer(d1, cap_style="flat", join_style="round")
            etroit = haut.buffer(d0, cap_style="flat", join_style="round")
            forme = large.difference(etroit).intersection(poly)
        bandes.append(g2._groupes_shapely(forme))
    return bandes


def ombre_portee(groupes, largeur):
    """Anneau qui déborde d'un contour, pour cerner un flocage d'une seconde couleur."""
    from shapely.geometry import Polygon
    from shapely.ops import unary_union
    plein = unary_union([Polygon(e, t).buffer(0) for e, t in groupes])
    return g2._groupes_shapely(plein.buffer(largeur, join_style="round").difference(plein))


# =========================================================================
#  PROGRAMME
# =========================================================================

def main():
    ap = argparse.ArgumentParser(
        description="Personnalise un cadre maillot 3MF (nom, numéro, signature).")
    ap.add_argument("source", help="projet 3MF d'origine")
    ap.add_argument("sortie", help="projet 3MF à écrire")
    ap.add_argument("--nom", default=NOM_MAILLOT, help="nom floqué au dos du maillot")
    ap.add_argument("--numero", default=NUMERO,
                    help="numéro ; par défaut on garde celui d'origine")
    ap.add_argument("--plaque", default=None,
                    help='texte de la plaque ; deux lignes séparées par "/"')
    ap.add_argument("--signature", default=None,
                    help='nom écrit à la main ; "" pour ne pas mettre de signature')
    ap.add_argument("--graine", type=int, default=SIGNATURE_GRAINE,
                    help="variante du tracé de la signature")
    ap.add_argument("--club", default=None,
                    help="texte du haut du cadre (nom du club)")
    ap.add_argument("--liseres", default=None, metavar="CONTOUR,BANDE",
                    help="ajoute un liseré tout autour du maillot et deux bandes "
                         "d'épaule ; deux numéros de filament, par exemple 1,4")
    ap.add_argument("--filament-nom", type=int, default=None, metavar="N",
                    help="filament du nom et du numéro floqués")
    ap.add_argument("--ombre", default=None, metavar="N[:LARGEUR]",
                    help="cerne le nom et le numéro d'une seconde couleur, "
                         "par exemple 4:0.9")
    ap.add_argument("--filament", action="append", default=[], metavar="N=#RRGGBB",
                    help="recolore un filament, par exemple --filament 2=#FFFFFF ; "
                         "répétable")
    a = ap.parse_args()

    nom = a.nom
    signature = a.signature if a.signature is not None else SIGNATURE
    if signature is None:
        signature = nom.title()
    if a.plaque is None:
        ligne1, ligne2 = PLAQUE_LIGNE_1, (PLAQUE_LIGNE_2 or nom)
    elif "/" in a.plaque:
        ligne1, ligne2 = [s.strip() for s in a.plaque.split("/", 1)]
    else:
        ligne1, ligne2 = "", a.plaque.strip()

    p = Projet(a.source)
    pieces = reperer(p)
    print("  pièces repérées :", ", ".join(
        f"{k}={lire_piece(p.cfg, v)['nom']!r}" if isinstance(v, int) and v is not None
        else f"{k}=" + str([lire_piece(p.cfg, o)['nom'] for o in v])
        for k, v in pieces.items() if v))

    # ------------------------------------------------- le flocage au dos
    oid = pieces["flocage"]
    V, T = p.maillage(oid)
    tris_nom, tris_num = couper_en_deux(V, T)
    gab_nom = gabarit_texte(V, tris_nom, arc=True)
    gab_num = gabarit_texte(V, tris_num)
    z0 = min(gab_nom["z0"], gab_num["z0"])
    z1 = max(gab_nom["z1"], gab_num["z1"])
    rayon = gab_nom["rayon"]
    centre = gab_nom["centre"] if rayon else (gab_nom["x0"] + gab_nom["x1"]) / 2

    ancien = re.sub(r"\s*\d+\s*$", "", lire_piece(p.cfg, oid)["nom"])
    police_nom, serrage = choisir_police(ancien, gab_nom["capitale"],
                                         gab_nom["largeur"], gab_nom["mesure"])
    groupes = texte_cadre(nom, police_nom, gab_nom["capitale"], gab_nom["base"],
                          centre_x=centre, condense=serrage, rayon=rayon)
    flocage = g2.mailler(groupes, z0, z1)

    if a.numero:
        gr_num = texte_cadre(str(a.numero), police_nom, gab_num["capitale"],
                             gab_num["base"],
                             centre_x=(gab_num["x0"] + gab_num["x1"]) / 2,
                             condense=serrage)
        flocage = fusionner(flocage, g2.mailler(gr_num, z0, z1))
        groupes = groupes + gr_num
        numero = str(a.numero)
    else:
        # chiffres d'origine conservés tels quels, maillage et contour SVG
        chiffres = recoller(V, tris_num)
        flocage = fusionner(flocage, chiffres)
        groupes = groupes + g2.grouper(g2.contours_du_dessus(*chiffres))
        m = re.search(r"(\d+)\s*$", lire_piece(p.cfg, oid)["nom"])
        numero = m.group(1) if m else ""

    p.remplacer(oid, *flocage)
    svg_flocage = lire_piece(p.cfg, oid)["svg"]
    reglages = {"nom": f"{nom} {numero}".strip(), "faces": len(flocage[1])}
    if svg_flocage:
        neuf = os.path.join(os.path.dirname(svg_flocage),
                            f"{nom}-{numero}".strip("- ").replace(" ", "_") + ".svg")
        reglages["svg"] = (svg_flocage, neuf)
        p.fichiers[neuf] = ecrire_svg(groupes)
        if neuf != svg_flocage:
            p.fichiers.pop(svg_flocage, None)
            p.ordre = [neuf if o == svg_flocage else o for o in p.ordre]
    p.cfg = modifier_piece(p.cfg, oid, **reglages)
    courbure = (f", cintré sur un rayon de {rayon * p.echelle(oid)[1]:.0f} mm"
                if rayon else ", droit")
    courbure += f", {os.path.basename(police_nom)[:-4]} à {serrage:.2f}"
    print(f"  flocage    « {nom} » ({numero or 'numéro inchangé'}) : "
          f"{len(flocage[1])} triangles, capitale "
          f"{gab_nom['capitale'] * p.echelle(oid)[1]:.2f} mm{courbure}")

    # ------------------------------------------------- la plaque du bas
    p1, p2 = pieces["plaque"]
    V1, T1 = p.maillage(p1)
    V2, T2 = p.maillage(p2)
    gab1, gab2 = gabarit_texte(V1, T1), gabarit_texte(V2, T2)
    # Les deux lignes ont la même taille de corps. On retient la plus petite
    # des deux mesures : c'est celle des lettres à sommet plat, les rondes
    # dépassant toujours un peu la ligne de capitale.
    cap = min(gab1["capitale"] * p.echelle(p1)[1], gab2["capitale"] * p.echelle(p2)[1])
    base1 = p.vers_monde(p1, (gab1["x0"], gab1["base"]))
    base2 = p.vers_monde(p2, (gab2["x0"], gab2["base"]))
    gauche = min(base1[0], base2[0])          # bord gauche commun aux deux lignes

    if ligne1:
        lignes = [(p1, ligne1, base1[1], gab1), (p2, ligne2, base2[1], gab2)]
    else:
        # une seule ligne : on la recentre sur la hauteur du bloc d'origine
        lignes = [(p2, ligne2, (base2[1] + base1[1] + cap) / 2 - cap / 2, gab2)]
        p.supprimer(p1)
        p.cfg = supprimer_piece(p.cfg, p1)

    serrages = [calibrer(lire_piece(p.cfg, q)["texte"], POLICE_PLAQUE,
                         cap / p.echelle(q)[1],
                         g["largeur"] * p.echelle(q)[0] / p.echelle(q)[1])
                for q, g in ((p1, gab1), (p2, gab2))]
    serrage_plaque = sum(serrages) / len(serrages)

    for pid, txt, base_monde, gab in lignes:
        x, y = p.vers_local(pid, (gauche, base_monde))
        grp = texte_cadre(txt, POLICE_PLAQUE, cap / p.echelle(pid)[1], y,
                          gauche_x=x, condense=serrage_plaque)
        maillage = g2.mailler(grp, gab["z0"], gab["z1"])
        p.remplacer(pid, *maillage)
        p.cfg = modifier_piece(p.cfg, pid, nom=txt, texte=txt, faces=len(maillage[1]))
        print(f"  plaque     « {txt} » : {len(maillage[1])} triangles, "
              f"capitale {cap:.2f} mm, chasse {serrage_plaque:.2f}")

    # ------------------------------------------------- la signature
    sid = pieces["signature"]
    if sid is not None and signature:
        Vs, Ts = p.maillage(sid)
        b = boite(Vs, Ts)
        ex, ey = p.echelle(sid)
        largeur = b[1] - b[0]
        traces, _ = sigm.cadrer(
            sigm.composer(signature, alea=SIGNATURE_ALEA, graine=a.graine),
            largeur, centre=((b[0] + b[1]) / 2, (b[2] + b[3]) / 2))
        gr_sig = g2.epaissir(traces, TRAIT_SIGNATURE / ex)
        m_sig = g2.mailler(gr_sig, b[4], b[5])
        p.remplacer(sid, *m_sig)
        p.cfg = modifier_piece(p.cfg, sid, nom=f"Signature {signature}",
                               faces=len(m_sig[1]))
        svg_sig = lire_piece(p.cfg, sid)["svg"]
        if svg_sig:
            p.fichiers[svg_sig] = ecrire_svg(gr_sig)
        ys = [q[1] for e, t in gr_sig for q in e]
        print(f"  signature  « {signature} » : {len(m_sig[1])} triangles, "
              f"{largeur * ex:.1f} x {(max(ys) - min(ys)) * ey:.1f} mm")
    elif sid is not None:
        # signature retirée : pièce, maillage et SVG associé disparaissent
        svg_sig = lire_piece(p.cfg, sid)["svg"]
        p.supprimer(sid)
        p.cfg = supprimer_piece(p.cfg, sid)
        if svg_sig:
            p.fichiers.pop(svg_sig, None)
        print("  signature  aucune (pièce retirée du projet)")

    # ------------------------------------------------- habillage du maillot
    def en_assemblage(oid, groupes):
        """Passe des contours du repère d'une pièce à celui de l'assemblage."""
        return [([p.vers_monde(oid, q) for q in e],
                 [[p.vers_monde(oid, q) for q in t] for t in trous])
                for e, trous in groupes]

    if a.ombre:
        fil, _, larg = a.ombre.partition(":")
        larg = float(larg) if larg else 0.9
        ex = p.echelle(oid)[0]
        anneau = ombre_portee(groupes, larg / ex)
        v = p.composants[oid]
        za, zb = z0 * v[8] + v[11], z1 * v[8] + v[11]
        m = g2.mailler(en_assemblage(oid, anneau), za, zb)
        n = p.ajouter(f"Ombre {nom}", *m, int(fil))
        print(f"  ombre      {larg:.1f} mm autour du flocage : {len(m[1])} triangles "
              f"(pièce {n}, filament {fil})")
    if a.filament_nom:
        p.cfg = modifier_piece(p.cfg, oid, extrudeur=a.filament_nom)

    if a.liseres:
        f_contour, f_bande = [int(x) for x in a.liseres.split(",")]
        mid = pieces["maillot"]
        Vm, Tm = p.maillage(mid)
        silhouette = max(g2.contours_du_dessus(Vm, Tm), key=len)
        silhouette = [p.vers_monde(mid, q) for q in silhouette]
        vm = p.composants[mid]
        dessus = boite(Vm, Tm)[5] * vm[8] + vm[11]
        bandes = liseres(silhouette, LISERES)
        for etq, groupe, fil in (("contour", bandes[0], f_contour),
                                 ("bande 1", bandes[1], f_bande),
                                 ("bande 2", bandes[2], f_contour)):
            if not groupe:
                continue
            m = g2.mailler(groupe, dessus - 0.1, dessus + 0.4)
            n = p.ajouter(f"Liseré {etq}", *m, fil)
            print(f"  liseré     {etq} : {len(m[1])} triangles "
                  f"(pièce {n}, filament {fil})")

    # ------------------------------------------------- le nom du club
    cid = pieces["club"]
    if a.club and cid is not None:
        Vc, Tc = p.maillage(cid)
        gab = gabarit_texte(Vc, Tc)
        serrage_club = calibrer(lire_piece(p.cfg, cid)["texte"], POLICE_PLAQUE,
                                gab["capitale"], gab["largeur"])
        grp = texte_cadre(a.club, POLICE_PLAQUE, gab["capitale"], gab["base"],
                          centre_x=(gab["x0"] + gab["x1"]) / 2,
                          condense=serrage_club)
        maillage = g2.mailler(grp, gab["z0"], gab["z1"])
        p.remplacer(cid, *maillage)
        p.cfg = modifier_piece(p.cfg, cid, nom=a.club, texte=a.club,
                               faces=len(maillage[1]))
        larg = (max(q[0] for e, t in grp for q in e)
                - min(q[0] for e, t in grp for q in e)) * p.echelle(cid)[0]
        bf = p.boite_monde(pieces["fond"])
        dispo = bf[1] - bf[0]
        print(f"  club       « {a.club} » : {len(maillage[1])} triangles, "
              f"largeur {larg:.1f} mm sur {dispo:.1f} disponibles, "
              f"chasse {serrage_club:.2f}")
        if larg > dispo - 2:
            print("             ATTENTION : le texte touche ou dépasse le cadre")

    # ------------------------------------------------- couleurs des filaments
    if a.filament:
        # Remplacement textuel de la seule liste des couleurs : un aller-retour
        # par le module json réécrirait tout le fichier de réglages.
        cle = "Metadata/project_settings.config"
        reglages = p.fichiers[cle].decode("utf-8")
        m = re.search(r'"filament_colour":\s*\[([^\]]*)\]', reglages)
        couleurs = re.findall(r'"(#[0-9A-Fa-f]{6,8})"', m.group(1))
        for regle in a.filament:
            n, c = regle.split("=", 1)
            n = int(n)
            if not 1 <= n <= len(couleurs):
                raise SystemExit(f"filament {n} inexistant "
                                 f"(le projet en compte {len(couleurs)})")
            couleurs[n - 1] = c if c.startswith("#") else "#" + c
        liste = ",\n        ".join(f'"{c}"' for c in couleurs)
        p.fichiers[cle] = (reglages[:m.start()]
                           + f'"filament_colour": [\n        {liste}\n    ]'
                           + reglages[m.end():]).encode("utf-8")
        print("  filaments  " + "  ".join(f"{i+1}:{c}" for i, c in enumerate(couleurs)))

    # ------------------------------------------------- titres et compteurs
    i = re.search(rf'<object id="{p.assemblage}">', p.cfg).start()
    j = p.cfg.index("</object>", i)
    total = sum(int(n) for n in re.findall(r'<mesh_stat face_count="(\d+)"',
                                           p.cfg[i:j]))
    p.cfg = (p.cfg[:i]
             + re.sub(r'(<metadata face_count=")\d+(")',
                      lambda m: m.group(1) + str(total) + m.group(2),
                      p.cfg[i:j], count=1)
             + p.cfg[j:])
    p.cfg = re.sub(r'(<metadata key="plater_name" value=")[^"]*(")',
                   lambda m: m.group(1) + echapper(nom.title()) + m.group(2),
                   p.cfg, count=1)
    def retitre(m):
        # « Joueur - Club - Jersey Frame » : on remplace ce qui a changé
        morceaux = [x.strip() for x in m.group(2).split("-")]
        if morceaux:
            morceaux[0] = nom.title()
        if a.club and len(morceaux) > 1:
            morceaux[1] = a.club.title()
        return m.group(1) + echapper(" - ".join(morceaux)) + m.group(3)

    p.modeles[RACINE] = re.sub(r'(<metadata name="Title">)([^<]*)(</metadata>)',
                               retitre, p.modeles[RACINE], count=1)

    p.enregistrer(a.sortie)
    print(f"\n  -> {a.sortie}  ({os.path.getsize(a.sortie) / 1024:.0f} Ko)")


if __name__ == "__main__":
    main()
