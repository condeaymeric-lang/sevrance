#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Cadre maillot 3D paramétrique — 200 x 150 mm
Génère un 3MF multicouleur + des STL séparés (un par filament).

Philosophie "zéro gaspillage" :
  - la plaque et le bord (les gros volumes) sont dans UNE seule couleur ;
  - toutes les autres couleurs ne sont que des SURCOUCHES de 0.6 mm
    (3 couches à 0.2 mm) posées sur le dessus du maillot ;
  - donc les changements d'outil n'arrivent que sur 3 couches du modèle.

Installation :
    pip install cadquery
    (ou : conda install -c conda-forge cadquery)

Utilisation :
    python tools/cadre_maillot_ol.py
Puis ouvrir  sortie/cadre_maillot.3mf  dans Bambu Studio.
"""

import os
import zipfile
import cadquery as cq

# =========================================================================
#  PARAMÈTRES — c'est la seule zone à modifier
# =========================================================================

NOM = "Grégory Lafarge"      # signature, en bas à droite du maillot
NUMERO = "10"                # gros chiffre central
CLUB = "OLYMPIQUE LYONNAIS"  # texte en haut de poitrine

DOSSIER_SORTIE = "sortie"
NOM_FICHIER = "cadre_maillot"

# --- Police ---
FONT = "DejaVu Sans"
FONT_BOLD = "DejaVu Sans"    # famille des textes en gras (variante via kind="bold")
FONT_PATH = None             # ou un chemin absolu vers un .ttf

# --- Cadre ---
CADRE_L = 200.0    # largeur (X)
CADRE_H = 150.0    # hauteur (Y)
PLAQUE_EP = 2.0    # épaisseur de la plaque de fond
BORD_L = 9.0       # largeur du bord
BORD_H = 7.0       # hauteur du bord au-dessus de la plaque
BORD_R = 4.0       # arrondi des angles extérieurs

# --- Maillot ---
MAILLOT_EP = 2.0   # épaisseur du maillot blanc au-dessus de la plaque
COUCHE = 0.6       # épaisseur des surcouches couleur (3 x 0.2 mm)
MAILLOT_R = 3.0    # arrondi de la silhouette

# --- Typo (tailles en mm) ---
T_CLUB = 7.0
T_NUMERO = 46.0
T_SIGNATURE = 6.0

# --- Couleurs (affichage dans le slicer, à remapper sur tes AMS) ---
C_FOND = "#16233FFF"    # bleu nuit  -> plaque + bord
C_BLANC = "#F2F2F0FF"   # blanc      -> maillot
C_BLEU = "#1B4CA1FF"    # bleu roi   -> col, manche gauche, textes
C_ROUGE = "#C8102EFF"   # rouge      -> manche droite, ourlet, numéro

# Astuce filament : mets C_FOND = C_BLEU pour ne charger que 3 bobines.

TOLERANCE_MAILLAGE = 0.05   # finesse de tessellation (mm)

# =========================================================================
#  GÉOMÉTRIE
# =========================================================================

Z_PLAQUE = PLAQUE_EP                     # dessus de la plaque
Z_MAILLOT = Z_PLAQUE + MAILLOT_EP        # dessus du maillot blanc
Z_TOP = Z_MAILLOT + COUCHE               # dessus des surcouches
Z_BORD = PLAQUE_EP + BORD_H

# Silhouette du maillot (mm, centrée sur 0,0) : épaules -> manches -> ourlet
SILHOUETTE = [
    (-45.0,  59.0),   # épaule gauche
    (-58.0,  30.0),   # bas de manche gauche
    (-40.0,  22.0),   # aisselle gauche
    (-44.0, -59.0),   # ourlet gauche
    ( 44.0, -59.0),   # ourlet droit
    ( 40.0,  22.0),   # aisselle droite
    ( 58.0,  30.0),   # bas de manche droite
    ( 45.0,  59.0),   # épaule droite
]

COL_RX, COL_RY = 17.0, 14.0    # encolure
COL_CY = 59.0                  # centre de l'encolure (sur la ligne d'épaule)
COL_BANDE = 6.0                # largeur de la bande du col


def _essayer_fillet(solide, rayons=(MAILLOT_R, 2.0, 1.0)):
    """Arrondit les arêtes verticales, en dégradant le rayon si ça casse."""
    for r in rayons:
        try:
            return solide.edges("|Z").fillet(r)
        except Exception:
            continue
    return solide


def construire_maillot():
    """Solide complet du maillot, de Z_PLAQUE à Z_TOP."""
    corps = (
        cq.Workplane("XY")
        .workplane(offset=Z_PLAQUE)
        .polyline(SILHOUETTE)
        .close()
        .extrude(Z_TOP - Z_PLAQUE)
    )
    corps = _essayer_fillet(corps)

    encolure = (
        cq.Workplane("XY")
        .workplane(offset=Z_PLAQUE - 1.0)
        .center(0, COL_CY)
        .ellipse(COL_RX, COL_RY)
        .extrude(Z_TOP - Z_PLAQUE + 2.0)
    )
    return corps.cut(encolure)


def bande_couleur(maillot):
    """Tranche supérieure du maillot (les 0.6 mm de surcouche)."""
    boite = (
        cq.Workplane("XY")
        .workplane(offset=Z_MAILLOT)
        .box(CADRE_L * 2, CADRE_H * 2, COUCHE, centered=(True, True, False))
    )
    return maillot.intersect(boite)


def _prisme_rect(x1, y1, x2, y2):
    """Prisme rectangulaire sur toute la hauteur de la bande couleur."""
    return (
        cq.Workplane("XY")
        .workplane(offset=Z_MAILLOT - 0.5)
        .moveTo(x1, y1).lineTo(x2, y1).lineTo(x2, y2).lineTo(x1, y2)
        .close()
        .extrude(COUCHE + 1.0)
    )


def _texte(txt, taille, x, y, halign="center", font=None, gras=False):
    # combine=False : le texte reste un solide autonome, il n'est ni fusionné
    # ni soustrait à un solide parent (CadQuery >= 2.3).
    kw = dict(combine=False, halign=halign, valign="center",
              font=font or FONT, kind="bold" if gras else "regular")
    if FONT_PATH:
        kw["fontPath"] = FONT_PATH
    return (
        cq.Workplane("XY")
        .workplane(offset=Z_MAILLOT)
        .center(x, y)
        .text(txt, taille, COUCHE, **kw)
    )


def construire():
    maillot = construire_maillot()
    bande = bande_couleur(maillot)

    # ---- éléments BLEUS -------------------------------------------------
    col_ext = (
        cq.Workplane("XY").workplane(offset=Z_MAILLOT - 0.5)
        .center(0, COL_CY).ellipse(COL_RX + COL_BANDE, COL_RY + COL_BANDE)
        .extrude(COUCHE + 1.0)
    )
    col_int = (
        cq.Workplane("XY").workplane(offset=Z_MAILLOT - 0.5)
        .center(0, COL_CY).ellipse(COL_RX, COL_RY)
        .extrude(COUCHE + 1.0)
    )
    col = col_ext.cut(col_int).intersect(bande)

    manche_g = _prisme_rect(-64, 16, -49, 66).intersect(bande)
    txt_club = _texte(CLUB, T_CLUB, 0, 26, font=FONT_BOLD, gras=True).intersect(bande)
    txt_sign = _texte(NOM, T_SIGNATURE, 38, -45, halign="right").intersect(bande)

    bleu = col.union(manche_g).union(txt_club).union(txt_sign)

    # ---- éléments ROUGES ------------------------------------------------
    manche_d = _prisme_rect(49, 16, 64, 66).intersect(bande)
    ourlet = _prisme_rect(-50, -62, 50, -53).intersect(bande)
    txt_num = _texte(NUMERO, T_NUMERO, 0, -8, font=FONT_BOLD, gras=True).intersect(bande)

    rouge = manche_d.union(ourlet).union(txt_num)

    # ---- le blanc, c'est tout le reste ----------------------------------
    blanc = maillot.cut(bleu).cut(rouge)

    # ---- plaque + bord (une seule couleur) -------------------------------
    plaque = (
        cq.Workplane("XY")
        .box(CADRE_L, CADRE_H, PLAQUE_EP, centered=(True, True, False))
    )
    ext = (
        cq.Workplane("XY")
        .box(CADRE_L, CADRE_H, Z_BORD, centered=(True, True, False))
        .edges("|Z").fillet(BORD_R)
    )
    inte = (
        cq.Workplane("XY")
        .workplane(offset=-1.0)
        .box(CADRE_L - 2 * BORD_L, CADRE_H - 2 * BORD_L, Z_BORD + 2,
             centered=(True, True, False))
    )
    fond = ext.cut(inte).union(plaque)

    return [
        ("fond", fond, C_FOND),
        ("maillot_blanc", blanc, C_BLANC),
        ("bleu", bleu, C_BLEU),
        ("rouge", rouge, C_ROUGE),
    ]


# =========================================================================
#  EXPORT 3MF (multi-objets + couleurs)
# =========================================================================

CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>"""

RELS = """<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>"""


def _mailler(workplane, tol):
    """Retourne (sommets, triangles) fusionnés pour tous les solides."""
    sommets, triangles = [], []
    for solide in workplane.vals():
        try:
            v, t = solide.tessellate(tol)
        except Exception:
            continue
        offset = len(sommets)
        sommets.extend((p.x, p.y, p.z) for p in v)
        triangles.extend((a + offset, b + offset, c + offset) for a, b, c in t)
    return sommets, triangles


def ecrire_3mf(pieces, chemin, tol=TOLERANCE_MAILLAGE):
    materiaux, objets, items = [], [], []
    oid = 2
    for idx, (nom, wp, couleur) in enumerate(pieces):
        sommets, triangles = _mailler(wp, tol)
        if not triangles:
            print(f"  ! {nom} : maillage vide, ignoré")
            continue
        materiaux.append(f'   <base name="{nom}" displaycolor="{couleur}"/>')

        v_xml = "".join(
            f'<vertex x="{x:.4f}" y="{y:.4f}" z="{z:.4f}"/>'
            for x, y, z in sommets
        )
        t_xml = "".join(
            f'<triangle v1="{a}" v2="{b}" v3="{c}"/>' for a, b, c in triangles
        )
        objets.append(
            f'  <object id="{oid}" name="{nom}" type="model" pid="1" pindex="{idx}">'
            f"<mesh><vertices>{v_xml}</vertices>"
            f"<triangles>{t_xml}</triangles></mesh></object>"
        )
        items.append(f'  <item objectid="{oid}"/>')
        oid += 1

    modele = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<model unit="millimeter" xml:lang="en-US" '
        'xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">\n'
        " <resources>\n"
        '  <basematerials id="1">\n' + "\n".join(materiaux) + "\n  </basematerials>\n"
        + "\n".join(objets) + "\n"
        " </resources>\n <build>\n" + "\n".join(items) + "\n </build>\n</model>\n"
    )

    with zipfile.ZipFile(chemin, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CONTENT_TYPES)
        z.writestr("_rels/.rels", RELS)
        z.writestr("3D/3dmodel.model", modele)


# =========================================================================
#  MAIN
# =========================================================================

def main():
    os.makedirs(DOSSIER_SORTIE, exist_ok=True)
    print("Construction de la géométrie...")
    pieces = construire()

    for nom, wp, _ in pieces:
        chemin = os.path.join(DOSSIER_SORTIE, f"{NOM_FICHIER}_{nom}.stl")
        cq.exporters.export(wp, chemin)
        print(f"  STL  -> {chemin}")

    chemin_3mf = os.path.join(DOSSIER_SORTIE, f"{NOM_FICHIER}.3mf")
    print("Écriture du 3MF...")
    ecrire_3mf(pieces, chemin_3mf)
    print(f"  3MF  -> {chemin_3mf}")
    print(f"\nTerminé. « {NUMERO} — {NOM} »")


if __name__ == "__main__":
    main()
