# tools/ — générateur de cadre maillot 3D

`cadre_maillot_ol.py` construit un cadre 200 × 150 mm avec un maillot de foot
en relief, et exporte de quoi imprimer en multicouleur :

- `sortie/cadre_maillot.3mf` — les quatre pièces avec leur couleur, à ouvrir
  dans Bambu Studio (ou tout slicer lisant le 3MF) ;
- `sortie/cadre_maillot_<pièce>.stl` — les mêmes pièces séparées, si tu
  préfères les charger une par une.

## Installation

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r tools/requirements.txt
```

CadQuery embarque OCCT : compte quelques centaines de Mo et une à deux
minutes d'installation.

## Utilisation

```bash
python tools/cadre_maillot_ol.py
```

Le dossier `sortie/` est créé à la racine du dépôt et n'est pas versionné.
Génération complète : une dizaine de secondes.

## Paramétrage

Tout se règle dans le bloc `PARAMÈTRES` en haut du fichier : `NOM`, `NUMERO`,
`CLUB`, les dimensions du cadre, les couleurs. La silhouette du maillot est la
liste `SILHOUETTE` (coordonnées en mm, centrées sur l'origine).

Les polices passent par leur nom de famille (`FONT`, `FONT_BOLD`) ; le gras est
obtenu par `kind="bold"`. Pour un `.ttf` précis, renseigner `FONT_PATH`.

## Découpage des couleurs

La plaque et le bord — l'essentiel du volume — sont d'une seule couleur. Les
autres teintes ne sont que des surcouches de 0,6 mm (3 couches à 0,2 mm)
posées sur le dessus du maillot : les changements d'outil ne tombent donc que
sur trois couches, d'où très peu de purge.

| Pièce | Couleur par défaut | Contenu |
| --- | --- | --- |
| `fond` | bleu nuit | plaque de fond + bord du cadre |
| `maillot_blanc` | blanc | corps du maillot |
| `bleu` | bleu roi | col, manche gauche, nom du club, signature |
| `rouge` | rouge | manche droite, ourlet, numéro |

Pour ne charger que trois bobines, mettre `C_FOND = C_BLEU`.

## Dans le slicer

Les quatre pièces sont exportées comme quatre objets distincts, déjà
positionnés les uns par rapport aux autres. Dans Bambu Studio, les
sélectionner toutes puis « Assembler en un seul objet » (*Assemble into one
object*) avant d'affecter un filament à chacune : les positions relatives sont
conservées et l'impression se fait en une seule pièce.
