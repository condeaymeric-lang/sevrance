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
| `--club` | texte du haut du cadre |
| `--filament` | recolore un filament, `--filament 2=#FFFFFF` ; répétable |
| `--filament-nom` | filament du nom et du numéro floqués |
| `--ombre` | cerne le nom et le numéro d'une seconde couleur, `--ombre 4:0.9` |
| `--liseres` | liseré autour du maillot et bandes d'épaule, `--liseres 1,4` |
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
  maillots — un cercle est ajusté sur le **centre** des lettres, jamais sur
  leur pied : une lettre inclinée a son coin inférieur plus bas que sa ligne
  de base, et d'autant plus bas qu'elle est loin du sommet, si bien qu'ajuster
  sur les pieds creuse l'arc. Le centre, lui, ne bouge pas quand la lettre
  pivote. Le rayon de la ligne de base s'en déduit en retranchant la demi-
  capitale. Les accents sont exclus de l'ajustement : leur pied n'est pas non
  plus sur la ligne de base, et les laisser passer suffit à inventer une
  courbure là où le nom est droit. La capitale est mesurée sur la lettre du
  sommet de l'arc, la seule qui soit encore d'aplomb.
- Le nouveau nom est cintré en faisant **pivoter chaque lettre d'un bloc**. Une
  déformation point par point écarterait le sommet des lettres vers
  l'extérieur et élargirait le mot de 15 % ; ici les lettres gardent leur
  forme, comme sur un vrai flocage.
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

Les caractères des maillots sont des polices de club, non redistribuables.
Barlow en est l'équivalent libre le plus proche, et le script en garde deux
graisses de chasse différente — `Barlow Condensed SemiBold` et
`Barlow SemiBold` — qu'il télécharge dans `tools/polices/` au besoin.

Le choix ne se fait pas à la main : le script **redessine le texte d'origine**
dans chaque police candidate, compare la largeur obtenue à celle mesurée sur le
modèle, et retient la police qui demande la correction la plus faible, puis
applique le petit resserrement résiduel. Sur les deux modèles essayés il choisit
tout seul l'étroite pour l'un (0,93) et la normale pour l'autre — deux flocages
que la même police aurait mal servis.

Le même calibrage s'applique à la plaque et au nom du club, et il évite un
débordement réel : sans lui, « OLYMPIQUE LYONNAIS » sortait à 127,9 mm dans une
ouverture de cadre de 126. Le script affiche la largeur obtenue et la largeur
disponible, et prévient si le texte touche le cadre.

La plaque et le nom du club utilisent Liberation Sans Bold, équivalent métrique
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

L'alphabet cursif ne porte pas d'accents : `Lorelaï` s'écrit `Lorelai`, comme
dans la plupart des signatures manuscrites. La lettre de base est bien tracée,
seul le signe diacritique tombe — le nom du maillot et celui de la plaque, eux,
gardent leurs accents.

`--signature ""` supprime la signature pour de bon : la pièce, son maillage, son
entrée dans le config et son SVG disparaissent du projet. Il ne reste rien à cet
endroit, pas même une pièce vide.

### Habillage du maillot

`--liseres CONTOUR,BANDE` et `--ombre N:LARGEUR` **ajoutent des pièces** au
projet plutôt que d'en modifier : un objet, un composant et une entrée de
réglages, avec le filament demandé.

Les liserés sont dérivés de la silhouette du maillot, extraite de son propre
maillage : un anneau de 1 mm suit tout le contour, puis deux bandes ne longent
que le bord supérieur — épaules, manches et encolure, ce qui dessine le col au
passage. Les largeurs et les intervalles sont dans la constante `LISERES` ;
tous restent au-dessus de 0,6 mm pour passer avec une buse de 0,4.

`--ombre` cerne le nom et le numéro d'un anneau de la largeur voulue. C'est un
anneau, pas une plaque posée dessous : les deux couleurs ne se recouvrent nulle
part.

Chaque pièce ajoutée est contrôlée avant écriture — maillage fermé, volume
positif — et le script s'arrête sans rien écrire si le contrôle échoue.

### Couleurs

`--filament N=#RRGGBB` recolore un filament du projet. Seule la liste des
couleurs est réécrite dans le fichier de réglages, par remplacement textuel :
un aller-retour par un analyseur JSON en réécrirait les 537 clés.

Le script ne change pas l'affectation des pièces aux filaments : pour savoir
quel numéro correspond à quoi, lancez-le une fois et lisez le repérage, ou
ouvrez le projet dans Bambu Studio.

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
