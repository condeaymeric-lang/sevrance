#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fabrique une signature manuscrite fictive à partir d'un nom.

Ce n'est pas une police : chaque lettre est décrite par une poignée de points
de passage, reliés en une seule ligne continue lissée (Catmull-Rom). Le tracé
est ensuite épaissi par `geometrie2d.epaissir`.

Le résultat est une écriture inventée. Elle ne reproduit la signature de
personne — c'est justement le but quand on remplace un autographe réel.
"""
import random
import unicodedata

# Repère d'écriture : ligne de base à y = 0, hauteur d'x = 1.
MONTANTE = 2.30      # sommet des lettres montantes (b, d, f, h, k, l, t)
DESCENDANTE = -0.85  # bas des lettres descendantes (g, j, p, q, y, z)

# Points de passage de chaque minuscule, de l'entrée (0, 0) à la sortie (a, 0).
# Le dernier couple de chaque liste donne l'avance horizontale.
MINUSCULES = {
    "a": [(.00, .00), (.15, .78), (.36, .95), (.55, .72), (.50, .26),
          (.30, .10), (.15, .34), (.26, .76), (.46, .90), (.60, .60),
          (.62, .22), (.72, .05)],
    "b": [(.00, .00), (.10, .90), (.22, 1.70), (.30, 2.25), (.22, 2.30),
          (.16, 1.90), (.20, 1.00), (.26, .35), (.40, .08), (.58, .22),
          (.60, .60), (.44, .78), (.30, .62), (.48, .55), (.72, .60)],
    "c": [(.00, .00), (.16, .70), (.40, .95), (.56, .82), (.48, .70),
          (.30, .74), (.22, .40), (.34, .10), (.56, .12), (.68, .05)],
    "d": [(.00, .00), (.15, .78), (.36, .95), (.52, .70), (.44, .28),
          (.26, .11), (.14, .40), (.28, .80), (.50, 1.55), (.60, 2.20),
          (.53, 2.42), (.45, 2.10), (.47, 1.20), (.56, .40), (.74, .05)],
    "e": [(.00, .00), (.12, .40), (.30, .55), (.44, .40), (.34, .22),
          (.20, .40), (.24, .72), (.44, .86), (.60, .60), (.70, .18),
          (.76, .05)],
    "f": [(.00, .00), (.14, .80), (.26, 1.70), (.34, 2.28), (.26, 2.30),
          (.18, 1.80), (.20, .90), (.22, .10), (.20, DESCENDANTE),
          (.34, -.72), (.44, -.30), (.46, .30), (.58, .60), (.74, .05)],
    "g": [(.00, .00), (.15, .78), (.36, .95), (.55, .72), (.50, .26),
          (.30, .10), (.16, .36), (.28, .78), (.50, .90), (.58, .40),
          (.56, -.20), (.44, DESCENDANTE), (.28, -.80), (.26, -.55),
          (.46, -.35), (.68, .00)],
    "h": [(.00, .00), (.10, .90), (.22, 1.70), (.30, 2.25), (.22, 2.30),
          (.16, 1.85), (.20, .95), (.26, .20), (.34, .55), (.50, .92),
          (.64, .80), (.66, .35), (.76, .05)],
    "i": [(.00, .00), (.14, .60), (.26, .92), (.34, .60), (.44, .18),
          (.58, .05)],
    "j": [(.00, .00), (.14, .60), (.26, .92), (.30, .30), (.28, -.30),
          (.20, DESCENDANTE), (.06, -.78), (.06, -.52), (.26, -.32),
          (.52, .02)],
    "k": [(.00, .00), (.10, .90), (.22, 1.70), (.30, 2.25), (.22, 2.30),
          (.16, 1.85), (.20, .95), (.24, .18), (.42, .62), (.58, .90),
          (.46, .52), (.32, .42), (.54, .34), (.68, .05)],
    "l": [(.00, .00), (.12, .90), (.24, 1.75), (.32, 2.28), (.24, 2.30),
          (.17, 1.85), (.20, .95), (.28, .28), (.44, .08), (.62, .05)],
    "m": [(.00, .00), (.10, .80), (.22, .95), (.32, .45), (.34, .06),
          (.44, .70), (.58, .95), (.68, .45), (.70, .06), (.80, .70),
          (.94, .95), (1.02, .45), (1.08, .05)],
    "n": [(.00, .00), (.10, .82), (.24, .95), (.36, .45), (.38, .06),
          (.50, .72), (.64, .95), (.74, .45), (.82, .05)],
    "o": [(.00, .00), (.14, .62), (.32, .94), (.52, .80), (.54, .40),
          (.38, .12), (.20, .28), (.24, .62), (.44, .82), (.62, .70),
          (.72, .55)],
    "p": [(.00, .00), (.12, .70), (.22, .95), (.26, .40), (.24, -.20),
          (.18, DESCENDANTE), (.30, -.70), (.34, -.10), (.36, .45),
          (.52, .82), (.66, .60), (.58, .28), (.42, .22), (.62, .18),
          (.78, .05)],
    "q": [(.00, .00), (.15, .78), (.36, .95), (.55, .72), (.50, .26),
          (.32, .10), (.18, .36), (.30, .78), (.52, .88), (.58, .30),
          (.54, -.30), (.46, DESCENDANTE), (.60, -.70), (.72, -.20),
          (.78, .05)],
    "r": [(.00, .00), (.15, .85), (.30, .95), (.28, .58), (.45, .70),
          (.60, .55), (.68, .20), (.76, .05)],
    "s": [(.00, .00), (.14, .60), (.28, .92), (.42, .80), (.30, .50),
          (.22, .22), (.36, .10), (.56, .22), (.66, .05)],
    "t": [(.00, .00), (.12, .90), (.22, 1.60), (.28, 2.05), (.24, 1.55),
          (.24, .80), (.28, .20), (.44, .12), (.58, .35), (.10, 1.20),
          (.52, 1.10), (.68, .05)],
    "u": [(.00, .00), (.10, .82), (.20, .95), (.30, .35), (.40, .04),
          (.52, .40), (.60, .95), (.64, .50), (.74, .05)],
    "v": [(.00, .00), (.12, .70), (.24, .95), (.34, .40), (.42, .06),
          (.56, .55), (.66, .92), (.62, .70), (.74, .62)],
    "w": [(.00, .00), (.12, .78), (.22, .95), (.32, .40), (.40, .05),
          (.52, .60), (.60, .95), (.68, .42), (.74, .06), (.86, .58),
          (.96, .92), (.92, .70), (1.04, .62)],
    "x": [(.00, .00), (.14, .60), (.30, .92), (.44, .55), (.56, .10),
          (.62, .05), (.30, .80), (.20, .55), (.48, .30), (.70, .05)],
    "y": [(.00, .00), (.10, .80), (.22, .95), (.32, .40), (.38, .06),
          (.50, .55), (.60, .92), (.56, .30), (.48, -.30), (.36, DESCENDANTE),
          (.20, -.78), (.20, -.52), (.42, -.30), (.68, .02)],
    "z": [(.00, .00), (.14, .70), (.30, .90), (.44, .70), (.26, .38),
          (.16, .10), (.34, .02), (.30, -.40), (.18, DESCENDANTE),
          (.06, -.72), (.10, -.48), (.34, -.28), (.62, .02)],
}

AVANCE = {c: max(p[0] for p in pts) + 0.10 for c, pts in MINUSCULES.items()}


# --------------------------------------------------------------- lissage

def _catmull(points, n=14, tension=0.0):
    """Passe une courbe lisse par tous les points (Catmull-Rom -> polyligne)."""
    P = [points[0]] + list(points) + [points[-1]]
    out = [points[0]]
    for i in range(len(P) - 3):
        p0, p1, p2, p3 = P[i], P[i+1], P[i+2], P[i+3]
        for k in range(1, n + 1):
            t = k / n
            t2, t3 = t * t, t * t * t
            s = (1 - tension) / 2
            out.append((
                p1[0] + s*(p2[0]-p0[0])*t + s*(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2
                + s*(3*p1[0]-p0[0]-3*p2[0]+p3[0])*t3,
                p1[1] + s*(p2[1]-p0[1])*t + s*(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2
                + s*(3*p1[1]-p0[1]-3*p2[1]+p3[1])*t3))
    return out


# --------------------------------------------------------------- capitale

def _capitale(lettre, hauteur=2.9, largeur=1.9):
    """Grande initiale : élan d'attaque + forme minuscule agrandie."""
    base = MINUSCULES.get(lettre.lower(), MINUSCULES["o"])
    k = max(p[1] for p in base) or 1.0
    forme = [(x * largeur, y * hauteur / max(k, 1.0)) for x, y in base]
    av = max(p[0] for p in forme) + 0.25
    return forme, av


def composer(nom, elan=True, penche=0.20, alea=0.010, graine=7):
    """Renvoie les tracés de la signature (listes de points, en unités d'x).

    elan   : grand geste d'attaque qui passe au-dessus du mot
    penche : inclinaison (cisaillement horizontal)
    """
    # Une signature ne porte pas ses accents : on écrit la lettre de base
    # plutôt que de sauter le signe faute de tracé pour « ï » ou « é ».
    nom = "".join(c for c in unicodedata.normalize("NFD", nom.strip())
                  if not unicodedata.combining(c))
    if not nom:
        return []
    rnd = random.Random(graine)
    traces = []

    # --- initiale
    forme, av = _capitale(nom[0])
    x = 0.0
    mot = [(p[0] + x, p[1]) for p in forme]
    x += av

    # --- suite du mot, d'un seul trait
    for ch in nom[1:].lower():
        pts = MINUSCULES.get(ch)
        if pts is None:
            x += 0.45
            continue
        mot.extend((p[0] + x, p[1]) for p in pts)
        x += AVANCE[ch]

    # --- paraphe : long trait qui remonte, puis revient sous le mot
    mot.extend([(x + 0.55, 0.30), (x + 1.25, 0.75), (x + 1.85, 0.95),
                (x + 1.55, 1.00), (x + 0.20, 0.55), (x - 1.90, -0.20),
                (x - 3.20, -0.62), (x - 3.55, -0.45), (x - 3.15, -0.38)])
    traces.append(mot)

    # --- grand élan d'attaque, tracé par-dessus l'ensemble
    if elan:
        h = 3.9
        traces.append([
            (0.10, 0.20), (0.70, 1.60), (1.90, 3.20), (3.30, h),
            (x * 0.62, h + 0.05), (x * 0.74, h - 0.25), (x * 0.45, h - 0.95),
            (1.90, 2.55), (1.05, 2.00), (0.72, 1.35),
        ])

    # Le tremblement porte sur les points de passage, pas sur la courbe lissée :
    # la main ondule lentement, elle ne vibre pas.
    out = []
    for t in traces:
        t = [(px + rnd.gauss(0, alea), py + rnd.gauss(0, alea)) for px, py in t]
        t = _catmull(t, 14)
        out.append([(px + penche * py, py) for px, py in t])
    return out


def cadrer(traces, largeur, centre=(0.0, 0.0)):
    """Met les tracés à l'échelle pour occuper `largeur`, centrés sur `centre`."""
    pts = [p for t in traces for p in t]
    x0 = min(p[0] for p in pts); x1 = max(p[0] for p in pts)
    y0 = min(p[1] for p in pts); y1 = max(p[1] for p in pts)
    k = largeur / (x1 - x0)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return [[((p[0] - cx) * k + centre[0], (p[1] - cy) * k + centre[1])
             for p in t] for t in traces], k
