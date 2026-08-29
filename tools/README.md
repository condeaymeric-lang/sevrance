# tools/ — cadres maillot 3D

Deux outils indépendants :

| Script | Ce qu'il fait |
| --- | --- |
| `personnaliser_maillot.py` | reprend un projet 3MF existant et y remplace le nom, le numéro et la signature |
| `cadre_maillot_ol.py` | fabrique un cadre complet depuis zéro, en géométrie paramétrique |

## Installation

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r tools/requirements.txt
```

`cadquery` n'est utile que pour le second script : il embarque OCCT et pèse
quelques centaines de Mo. Pour la seule personnalisation, il suffit
d'installer `fonttools`, `shapely`, `mapbox_earcut` et `numpy`.

---

## `personnaliser_maillot.py`

Prend un projet Bambu Studio de cadre maillot dans lequel chaque élément est
une pièce séparée, et n'en réécrit que les maillages concernés : le flocage au
dos du maillot, le texte de la plaque et la signature. Tout le reste du projet —
réglages d'impression, affectation des filaments, positions, plaques du cadre —
est recopié à l'octet près. Sur les deux modèles essayés, 28 des 30 ou 31
fichiers de l'archive ressortent identiques octet pour octet.

```bash
python tools/personnaliser_maillot.py source.3mf sortie.3mf \
    --nom DURAND --signature Durand
```

| Option | Effet |
| --- | --- |
| `--nom` | nom floqué au dos du maillot, et sur la plaque par défaut |
| `--numero` | numéro au dos ; sans cette option, celui d'origine est **conservé tel quel** |
| `--plaque` | texte de la plaque ; `"PRÉNOM / NOM"` pour deux lignes, sinon une seule, recentrée |
| `--signature` | nom écrit à la main ; `--signature ""` retire complètement la pièce |
| `--graine` | change le tracé de la signature sans changer le nom |

Les valeurs par défaut sont en tête du script, dans le bloc `PARAMÈTRES`.

### Comment il se repère

Rien n'est codé en dur, ni les identifiants de pièces ni les millimètres. D'un
modèle à l'autre les numéros changent, et les maillages sont tantôt dans
`3D/3dmodel.model`, tantôt éclatés dans `3D/Objects/*.model` : le script gère
les deux et retrouve les pièces à leur **place dans le cadre**.

- Le fond et le maillot sont les deux plus grandes pièces.
- La plaque et la signature sont les pièces situées sous le maillot, dans le bas
  du cadre ; celles qui portent un `text_info` sont les lignes de la plaque.
- Le flocage est la pièce posée sur le maillot qui compte le plus de triangles :
  les rayures et liserés n'en font que quelques dizaines.

Il **mesure** ensuite la pièce d'origine et cale la nouvelle dessus.

- Le flocage est découpé en deux paquets de part et d'autre du plus grand vide
  horizontal : le nom au-dessus, le numéro en dessous.
- La hauteur de capitale est la **médiane** des sommets de lettres, pour qu'un
  accent isolé (le `Ć` de `IBRAHIMOVIĆ`) ne fausse pas la mesure.
- Si le nom d'origine est **cintré en arc** — c'est le cas de beaucoup de
  maillots — un cercle est ajusté sur les pieds de lettres et le nouveau nom
  est courbé sur le même rayon. Les accents sont exclus de cet ajustement :
  leur pied n'est pas sur la ligne de base, et les laisser passer suffit à
  inventer une courbure là où le nom est droit. La capitale est alors mesurée
  sur la lettre du sommet de l'arc, la seule qui soit encore d'aplomb.
- Les deux lignes de la plaque reçoivent la même taille de corps : la plus
  petite des deux mesures, celle des lettres à sommet plat, les rondes
  dépassant toujours un peu la ligne de capitale.
- Ligne de base, cadrage et épaisseur sont repris de l'ancienne géométrie.

Le repérage est affiché à chaque exécution, pour qu'une erreur se voie avant
d'ouvrir le fichier.

Le nouveau maillage est extrudé depuis les contours 2D (`geometrie2d.py`) :
triangulation par `mapbox_earcut`, fusion des chevauchements par `shapely`.
Chaque pièce produite est vérifiable : maillage fermé, orienté vers l'extérieur,
volume positif.

Le SVG associé à la pièce est réécrit en même temps, à la même échelle, pour que
la pièce reste modifiable dans Bambu Studio. Le `text_info` de la plaque est mis
à jour lui aussi : si vous rouvrez l'outil texte, Bambu régénère bien le nouveau
nom.

### Polices

Le caractère du flocage d'origine est une police de club, non redistribuable.
`Barlow Condensed SemiBold` en est l'équivalent libre le plus proche ; le script
la télécharge dans `tools/polices/` au premier lancement. `CONDENSE_MAILLOT`
(0.93) resserre les lettres pour retomber sur les proportions du flocage
d'origine. La plaque utilise Liberation Sans Bold, équivalent métrique
d'Helvetica.

### La signature

`signature_manuscrite.py` **dessine** une écriture, il n'utilise pas de police.
Chaque lettre est une poignée de points de passage reliés en une seule ligne
continue lissée, avec inclinaison, ondulation de la main et paraphe final ; le
trait est ensuite épaissi à la largeur voulue (0,46 mm par défaut, celle de
l'autographe d'origine).

C'est une écriture inventée : elle ne reproduit la signature de personne. C'est
précisément ce qu'on veut en remplaçant un autographe réel par un nom fictif.
`--graine` donne d'autres variantes du même nom.

`--signature ""` supprime la signature pour de bon : la pièce, son maillage, son
entrée dans le config et son SVG disparaissent du projet. Il ne reste rien à cet
endroit, pas même une pièce vide.

### Ce que le script ne met pas à jour

Les vignettes de plaque (`Metadata/plate_*.png`) et les photos du modèle
(`Auxiliaries/`) restent celles du fichier d'origine : elles montrent donc
encore l'ancien nom. Bambu Studio régénère les vignettes au premier découpage.
La description du modèle, écrite par son auteur, est conservée telle quelle.

---

## `cadre_maillot_ol.py`

Construit un cadre 200 × 150 mm avec un maillot en relief et exporte
`sortie/cadre_maillot.3mf` (quatre pièces colorées) plus un STL par pièce.

```bash
python tools/cadre_maillot_ol.py
```

Tout se règle dans le bloc `PARAMÈTRES` : `NOM`, `NUMERO`, `CLUB`, dimensions,
couleurs. La silhouette est la liste `SILHOUETTE`, en millimètres.

La plaque et le bord — l'essentiel du volume — sont d'une seule couleur ; les
autres teintes ne sont que des surcouches de 0,6 mm posées sur le maillot, si
bien que les changements d'outil ne tombent que sur trois couches.

| Pièce | Couleur par défaut | Contenu |
| --- | --- | --- |
| `fond` | bleu nuit | plaque de fond + bord du cadre |
| `maillot_blanc` | blanc | corps du maillot |
| `bleu` | bleu roi | col, manche gauche, nom du club, signature |
| `rouge` | rouge | manche droite, ourlet, numéro |

Dans Bambu Studio, sélectionner les quatre pièces puis « Assembler en un seul
objet » avant d'affecter les filaments.
