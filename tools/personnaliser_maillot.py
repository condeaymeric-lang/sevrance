#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Personnalise un cadre maillot 3MF (projet Bambu Studio) : nom, numéro, signature.

Le fichier d'origine est un projet Bambu Studio dans lequel chaque élément est
une pièce séparée (le maillot, les rayures, le nom au dos, la plaque, la
signature...). On ne touche donc qu'aux maillages des pièces concernées :
tout le reste du projet — réglages d'impression, affectation des filaments,
positions — est repris tel quel.

Ce que le script remplace :
  * le nom floqué au dos du maillot          (pièce SVG « IBRAHIMOVIĆ 11 »)
  * le numéro, si NUMERO est renseigné       (même pièce)
  * les deux lignes de la plaque             (pièces texte « ZLATAN » / « IBRAHIMOVIĆ »)
  * la signature                             (pièce SVG « Handtekening ... »)

La signature produite est une écriture inventée, fabriquée trait par trait
par `signature_manuscrite` : elle ne reproduit l'autographe de personne.

Dépendances :  pip install -r tools/requirements.txt
Utilisation :  python tools/personnaliser_maillot.py source.3mf sortie.3mf
"""
import argparse
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
PLAQUE_LIGNE_2 = "DURAND"   # nom

SIGNATURE = "Durand"        # None = dérivé du nom ; "" = pas de signature
SIGNATURE_GRAINE = 7        # change le tracé sans changer le nom
SIGNATURE_ALEA = 0.030      # ampleur de l'ondulation de la main
TRAIT_SIGNATURE = 0.46      # largeur du trait, en mm (celle de l'autographe d'origine)

# Polices. Celle du maillot d'origine est un caractère de club, non
# redistribuable : Barlow Condensed en est l'équivalent libre le plus proche.
POLICE_MAILLOT = "BarlowCondensed-SemiBold.ttf"
CONDENSE_MAILLOT = 0.93     # resserrement horizontal, calé sur le flocage d'origine
POLICE_PLAQUE = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

URL_POLICE_MAILLOT = ("https://raw.githubusercontent.com/google/fonts/main/"
                      "ofl/barlowcondensed/BarlowCondensed-SemiBold.ttf")

# Identifiants des pièces dans le projet d'origine.
PIECE_FLOCAGE = 9           # nom + numéro au dos du maillot
PIECE_PLAQUE_1 = 10         # première ligne de la plaque
PIECE_PLAQUE_2 = 11         # seconde ligne
PIECE_SIGNATURE = 12


# =========================================================================
#  LECTURE DU 3MF
# =========================================================================

def lire_3mf(chemin):
    with zipfile.ZipFile(chemin) as z:
        return {i.filename: z.read(i.filename) for i in z.infolist()}


def ecrire_3mf(pieces, chemin, ordre):
    with zipfile.ZipFile(chemin, "w", zipfile.ZIP_DEFLATED) as z:
        for nom in ordre:
            if nom in pieces:
                z.writestr(nom, pieces[nom])


def bloc_objet(xml, oid):
    i = xml.index(f'<object id="{oid}" type="model">')
    j = xml.index("</object>", i) + len("</object>")
    return i, j


def lire_maillage(xml, oid):
    i, j = bloc_objet(xml, oid)
    seg = xml[i:j]
    V = [(float(a), float(b), float(c)) for a, b, c in
         re.findall(r'<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"/>', seg)]
    T = [(int(a), int(b), int(c)) for a, b, c in
         re.findall(r'<triangle v1="([^"]+)" v2="([^"]+)" v3="([^"]+)"', seg)]
    return V, T


def xml_maillage(oid, V, T):
    v = "".join(f'     <vertex x="{x:.9g}" y="{y:.9g}" z="{z:.9g}"/>\n' for x, y, z in V)
    t = "".join(f'     <triangle v1="{a}" v2="{b}" v3="{c}"/>\n' for a, b, c in T)
    return (f'<object id="{oid}" type="model">\n   <mesh>\n'
            f'    <vertices>\n{v}    </vertices>\n'
            f'    <triangles>\n{t}    </triangles>\n   </mesh>\n  </object>')


def remplacer_maillage(xml, oid, V, T):
    i, j = bloc_objet(xml, oid)
    return xml[:i] + xml_maillage(oid, V, T) + xml[j:]


def supprimer_objet(xml, oid):
    i, j = bloc_objet(xml, oid)
    while i > 0 and xml[i - 1] in " \t":
        i -= 1
    if i > 0 and xml[i - 1] == "\n":
        i -= 1
    xml = xml[:i] + xml[j:]
    return re.sub(rf'\n *<component objectid="{oid}"[^>]*/>', "", xml)


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


def gabarit_texte(V, T):
    """Ligne de base, hauteur de capitale et cadrage d'un texte déjà maillé.

    La hauteur retenue est la médiane des sommets de lettres : un accent ou un
    point isolé ne fausse donc pas la mesure.
    """
    morceaux = composantes(V, T)
    boites = [boite(V, m) for m in morceaux]
    base = min(b[2] for b in boites)
    return {
        "base": base,
        "capitale": mediane([b[3] for b in boites]) - base,
        "x0": min(b[0] for b in boites),
        "x1": max(b[1] for b in boites),
        "z0": min(b[4] for b in boites),
        "z1": max(b[5] for b in boites),
    }


def couper_en_deux(V, T):
    """Coupe un maillage en deux paquets, de part et d'autre du plus grand vide en Y."""
    morceaux = composantes(V, T)
    boites = [boite(V, m) for m in morceaux]
    bandes = sorted((b[2], b[3]) for b in boites)
    vide, seuil = 0.0, None
    haut = bandes[0][1]
    for y0, y1 in bandes[1:]:
        if y0 - haut > vide:
            vide, seuil = y0 - haut, (y0 + haut) / 2
        haut = max(haut, y1)
    dessus = [m for m, b in zip(morceaux, boites) if b[2] > seuil]
    dessous = [m for m, b in zip(morceaux, boites) if b[2] <= seuil]
    return [t for m in dessus for t in m], [t for m in dessous for t in m]


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
#  SVG (pour que la pièce reste modifiable dans Bambu Studio)
# =========================================================================

PT = 25.4 / 72.0      # Bambu importe les SVG en points PostScript


def ecrire_svg(groupes):
    """Écrit des contours (en mm) dans un SVG que Bambu Studio réimportera
    à la même échelle."""
    pts = [p for e, t in groupes for p in e]
    x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
    y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
    L, H = (x1 - x0) / PT, (y1 - y0) / PT

    chemins = []
    for ext, trous in groupes:
        d = []
        for anneau in [ext] + trous:
            c = [f"M{(p[0]-x0)/PT:.3f} {(y1-p[1])/PT:.3f}" if i == 0
                 else f"L{(p[0]-x0)/PT:.3f} {(y1-p[1])/PT:.3f}"
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
#  CONSTRUCTION DES NOUVELLES PIÈCES
# =========================================================================

def police_maillot():
    """Chemin de la police du flocage ; la télécharge au besoin."""
    dossier = os.path.join(os.path.dirname(os.path.abspath(__file__)), "polices")
    chemin = os.path.join(dossier, POLICE_MAILLOT)
    if os.path.exists(chemin):
        return chemin
    if os.path.isabs(POLICE_MAILLOT) and os.path.exists(POLICE_MAILLOT):
        return POLICE_MAILLOT
    os.makedirs(dossier, exist_ok=True)
    import urllib.request
    print(f"  téléchargement de {POLICE_MAILLOT}...")
    urllib.request.urlretrieve(URL_POLICE_MAILLOT, chemin)
    return chemin


def texte_cadre(txt, police, capitale, base, z0, z1,
                centre_x=None, gauche_x=None, condense=1.0):
    """Contours d'un texte posés sur une ligne de base, centrés ou alignés à gauche."""
    contours = g2.contours_texte(txt, police, capitale, condense=condense)
    xs = [p[0] for c in contours for p in c]
    dx = (centre_x - (min(xs) + max(xs)) / 2) if centre_x is not None \
        else (gauche_x - min(xs))
    contours = [[(p[0] + dx, p[1] + base) for p in c] for c in contours]
    return g2.assainir(contours)


# =========================================================================
#  RÉGLAGES DU PROJET (Metadata/model_settings.config)
# =========================================================================

def bloc_piece(cfg, pid):
    i = cfg.index(f'<part id="{pid}"')
    j = cfg.index("</part>", i) + len("</part>")
    return i, j


def modifier_piece(cfg, pid, **valeurs):
    """Change des attributs dans le bloc d'une pièce (nom, texte, nb de faces)."""
    i, j = bloc_piece(cfg, pid)
    seg = cfg[i:j]
    if "nom" in valeurs:
        seg = re.sub(r'(<metadata key="name" value=")[^"]*(")',
                     lambda m: m.group(1) + echapper(valeurs["nom"]) + m.group(2), seg, count=1)
    if "texte" in valeurs:
        seg = re.sub(r'(<text_info text=")[^"]*(")',
                     lambda m: m.group(1) + echapper(valeurs["texte"]) + m.group(2), seg, count=1)
    if "faces" in valeurs:
        seg = re.sub(r'(<mesh_stat face_count=")\d+(")',
                     lambda m: m.group(1) + str(valeurs["faces"]) + m.group(2), seg, count=1)
    if "svg" in valeurs:
        seg = seg.replace('filepath="' + valeurs["svg"][0] + '"',
                          'filepath="' + valeurs["svg"][1] + '"')
        seg = seg.replace('filepath3mf="3D/' + valeurs["svg"][0] + '"',
                          'filepath3mf="3D/' + valeurs["svg"][1] + '"')
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


def transformation(xml, oid):
    """Échelle et translation du composant `oid` dans l'assemblage."""
    m = re.search(rf'<component objectid="{oid}" transform="([^"]*)"', xml)
    v = [float(x) for x in m.group(1).split()]
    return (v[0], v[4], v[8]), (v[9], v[10], v[11])


# =========================================================================
#  PROGRAMME
# =========================================================================

def svg_de_piece(cfg, pid):
    """Nom du fichier SVG associé à une pièce, s'il y en a un."""
    i, j = bloc_piece(cfg, pid)
    m = re.search(r'filepath3mf="([^"]+)"', cfg[i:j])
    return m.group(1) if m else None


def total_faces(cfg, oid):
    i = cfg.index(f'<object id="{oid}">')
    j = cfg.index("</object>", i)
    return sum(int(n) for n in re.findall(r'<mesh_stat face_count="(\d+)"', cfg[i:j]))


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

    pieces = lire_3mf(a.source)
    ordre = list(pieces)
    xml = pieces["3D/3dmodel.model"].decode("utf-8")
    cfg = pieces["Metadata/model_settings.config"].decode("utf-8")
    svg_flocage = svg_de_piece(cfg, PIECE_FLOCAGE)
    svg_signature = svg_de_piece(cfg, PIECE_SIGNATURE)
    police = police_maillot()

    # ------------------------------------------------- le flocage au dos
    V, T = lire_maillage(xml, PIECE_FLOCAGE)
    tris_nom, tris_num = couper_en_deux(V, T)
    gab_nom, gab_num = gabarit_texte(V, tris_nom), gabarit_texte(V, tris_num)
    z0 = min(gab_nom["z0"], gab_num["z0"])
    z1 = max(gab_nom["z1"], gab_num["z1"])
    ech, _ = transformation(xml, PIECE_FLOCAGE)

    groupes = texte_cadre(nom, police, gab_nom["capitale"], gab_nom["base"], z0, z1,
                          centre_x=(gab_nom["x0"] + gab_nom["x1"]) / 2,
                          condense=CONDENSE_MAILLOT)
    flocage = g2.mailler(groupes, z0, z1)

    if a.numero:
        gr_num = texte_cadre(str(a.numero), police, gab_num["capitale"],
                             gab_num["base"], z0, z1,
                             centre_x=(gab_num["x0"] + gab_num["x1"]) / 2,
                             condense=CONDENSE_MAILLOT)
        flocage = fusionner(flocage, g2.mailler(gr_num, z0, z1))
        groupes = groupes + gr_num
        numero = str(a.numero)
    else:
        # chiffres d'origine conservés tels quels, maillage et contour SVG
        chiffres = recoller(V, tris_num)
        flocage = fusionner(flocage, chiffres)
        groupes = groupes + g2.grouper(g2.contours_du_dessus(*chiffres))
        m = re.search(r'<metadata key="name" value="[^"]*?(\d+)"/>', cfg[bloc_piece(cfg, PIECE_FLOCAGE)[0]:])
        numero = m.group(1) if m else ""

    xml = remplacer_maillage(xml, PIECE_FLOCAGE, *flocage)
    etiquette = numero or "numéro d'origine"
    print(f"  flocage    « {nom} » ({etiquette}) : {len(flocage[1])} triangles, "
          f"capitale {gab_nom['capitale'] * ech[1]:.2f} mm")

    # ------------------------------------------------- la plaque du bas
    V1, T1 = lire_maillage(xml, PIECE_PLAQUE_1)
    V2, T2 = lire_maillage(xml, PIECE_PLAQUE_2)
    gab1, gab2 = gabarit_texte(V1, T1), gabarit_texte(V2, T2)
    _, t1 = transformation(xml, PIECE_PLAQUE_1)
    _, t2 = transformation(xml, PIECE_PLAQUE_2)
    cap = gab2["capitale"]
    gauche = min(gab1["x0"] + t1[0], gab2["x0"] + t2[0])   # bord gauche commun

    if ligne1:
        lignes = [(PIECE_PLAQUE_1, ligne1, gab1["base"] + t1[1], gab1, t1),
                  (PIECE_PLAQUE_2, ligne2, gab2["base"] + t2[1], gab2, t2)]
    else:
        # une seule ligne : on la recentre sur la hauteur du bloc d'origine
        centre = ((gab2["base"] + t2[1]) + (gab1["base"] + t1[1] + cap)) / 2
        lignes = [(PIECE_PLAQUE_2, ligne2, centre - cap / 2, gab2, t2)]
        xml = supprimer_objet(xml, PIECE_PLAQUE_1)
        cfg = supprimer_piece(cfg, PIECE_PLAQUE_1)

    for pid, txt, base, gab, tr in lignes:
        grp = texte_cadre(txt, POLICE_PLAQUE, cap, base - tr[1],
                          gab["z0"], gab["z1"], gauche_x=gauche - tr[0])
        maillage = g2.mailler(grp, gab["z0"], gab["z1"])
        xml = remplacer_maillage(xml, pid, *maillage)
        cfg = modifier_piece(cfg, pid, nom=txt, texte=txt, faces=len(maillage[1]))
        print(f"  plaque     « {txt} » : {len(maillage[1])} triangles, "
              f"capitale {cap:.2f} mm")

    # ------------------------------------------------- la signature
    if signature:
        Vs, Ts = lire_maillage(xml, PIECE_SIGNATURE)
        b = boite(Vs, Ts)
        ech_s, _ = transformation(xml, PIECE_SIGNATURE)
        largeur = b[1] - b[0]
        traces, _ = sigm.cadrer(
            sigm.composer(signature, alea=SIGNATURE_ALEA, graine=a.graine),
            largeur, centre=((b[0] + b[1]) / 2, (b[2] + b[3]) / 2))
        gr_sig = g2.epaissir(traces, TRAIT_SIGNATURE / ech_s[0])
        m_sig = g2.mailler(gr_sig, b[4], b[5])
        xml = remplacer_maillage(xml, PIECE_SIGNATURE, *m_sig)
        cfg = modifier_piece(cfg, PIECE_SIGNATURE, nom=f"Signature {signature}",
                             faces=len(m_sig[1]))
        ys = [p[1] for e, t in gr_sig for p in e]
        print(f"  signature  « {signature} » : {len(m_sig[1])} triangles, "
              f"{largeur * ech_s[0]:.1f} x {(max(ys) - min(ys)) * ech_s[1]:.1f} mm")
    else:
        # signature retirée : pièce, maillage et SVG associé disparaissent
        gr_sig = None
        xml = supprimer_objet(xml, PIECE_SIGNATURE)
        cfg = supprimer_piece(cfg, PIECE_SIGNATURE)
        print("  signature  aucune (pièce retirée du projet)")

    # ------------------------------------------------- noms et compteurs
    nouveau_svg = "3D/" + f"{nom}-{numero}".strip("- ").replace(" ", "_") + ".svg"
    cfg = modifier_piece(cfg, PIECE_FLOCAGE, nom=f"{nom} {numero}".strip(),
                         faces=len(flocage[1]),
                         svg=(os.path.basename(svg_flocage),
                              os.path.basename(nouveau_svg)))
    cfg = re.sub(r'(<object id="13">\s*<metadata key="name" value="[^"]*"/>\s*'
                 r'<metadata key="extruder" value="\d+"/>\s*<metadata face_count=")\d+(")',
                 lambda m: m.group(1) + str(total_faces(cfg, 13)) + m.group(2),
                 cfg, count=1)
    cfg = re.sub(r'(<metadata key="plater_name" value=")[^"]*(")',
                 lambda m: m.group(1) + echapper(nom.title()) + m.group(2), cfg, count=1)
    xml = re.sub(r'(<metadata name="Title">)[^<]*(</metadata>)',
                 lambda m: m.group(1)
                 + echapper(f"{nom.title()} - AC Milan - Jersey Frame") + m.group(2),
                 xml, count=1)

    # ------------------------------------------------- écriture du 3MF
    pieces["3D/3dmodel.model"] = xml.encode("utf-8")
    pieces["Metadata/model_settings.config"] = cfg.encode("utf-8")
    pieces[nouveau_svg] = ecrire_svg(groupes)
    if svg_flocage and svg_flocage != nouveau_svg:
        pieces.pop(svg_flocage, None)
        ordre = [nouveau_svg if o == svg_flocage else o for o in ordre]
    if svg_signature:
        if gr_sig is None:
            pieces.pop(svg_signature, None)
        else:
            pieces[svg_signature] = ecrire_svg(gr_sig)

    ecrire_3mf(pieces, a.sortie, ordre)
    print(f"\n  -> {a.sortie}  ({os.path.getsize(a.sortie) / 1024:.0f} Ko)")


if __name__ == "__main__":
    main()
