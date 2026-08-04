'use client';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Container,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  initials,
  Input,
  Label,
  LiveBadge,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@matchly/ui';
import { MoreHorizontal, Share2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';

/** Bloc de démonstration : un titre, une note d'usage, un rendu. */
function Showcase({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="border-t border-border py-12 first:border-t-0">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{note}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** Nuancier d'une échelle de couleurs. */
function Swatches({ name, prefix }: { name: string; prefix: string }) {
  const steps = [100, 300, 500, 700, 900] as const;

  return (
    <div>
      <p className="text-sm font-medium">{name}</p>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-border">
        {steps.map((step) => (
          <div key={step} className="flex-1">
            <div className="h-16" style={{ backgroundColor: `var(--matchly-${prefix}-${step})` }} />
            <p className="bg-card py-1.5 text-center text-[0.625rem] text-muted-foreground tabular-nums">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DesignSystemShowcase() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <Container className="pb-24">
      <Showcase
        title="Couleurs"
        note="Palette de marque en OKLCH. Les tokens sémantiques (background, primary, muted…) changent avec le thème ; la palette brute reste absolue."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <Swatches name="Violet — primaire" prefix="violet" />
          <Swatches name="Bleu — secondaire" prefix="blue" />
          <Swatches name="Cyan — accent" prefix="cyan" />
        </div>

        <div className="mt-8 h-24 rounded-2xl bg-gradient-brand" />
        <p className="mt-2 text-xs text-muted-foreground">
          Dégradé de marque — élément graphique signature, identique partout.
        </p>
      </Showcase>

      <Showcase
        title="Typographie"
        note="Poppins, servie depuis notre domaine par next/font. L’échelle suit un rapport constant pour rester lisible du mobile au grand écran."
      >
        <div className="flex flex-col gap-4">
          <p className="text-5xl font-semibold tracking-tight">Chaque match mérite son public</p>
          <p className="text-3xl font-semibold tracking-tight">Titre de section</p>
          <p className="text-xl font-medium">Sous-titre</p>
          <p className="text-base">
            Corps de texte. Le sport amateur produit des millions de matchs par an.
          </p>
          <p className="text-sm text-muted-foreground">Texte secondaire et légendes.</p>
        </div>
      </Showcase>

      <Showcase
        title="Boutons"
        note="Une seule action principale par écran. La variante « gradient » est réservée aux appels à l’action majeurs : en abuser dilue l’identité."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="gradient">Regarder le direct</Button>
          <Button variant="primary">Principal</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="outline">Contour</Button>
          <Button variant="ghost">Fantôme</Button>
          <Button variant="destructive">Supprimer</Button>
          <Button variant="link">Lien</Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button size="sm">Petit</Button>
          <Button size="md">Moyen</Button>
          <Button size="lg">Grand</Button>
          <Button size="xl">Très grand</Button>
          <Button size="icon" variant="outline" aria-label="Plus d’options">
            <MoreHorizontal aria-hidden />
          </Button>
          <Button disabled>Désactivé</Button>
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 1600);
            }}
          >
            Tester le chargement
          </Button>
        </div>
      </Showcase>

      <Showcase
        title="Étiquettes"
        note="LiveBadge n’est pas une variante de Badge : il porte un token de couleur dédié, une animation et une région aria-live pour le compteur de spectateurs."
      >
        <div className="flex flex-wrap items-center gap-3">
          <LiveBadge viewerCount={1_240} />
          <LiveBadge />
          <Badge>Par défaut</Badge>
          <Badge variant="brand">Football</Badge>
          <Badge variant="accent">Nouveau</Badge>
          <Badge variant="secondary">Secondaire</Badge>
          <Badge variant="outline">Contour</Badge>
          <Badge variant="success">Terminé</Badge>
          <Badge variant="warning">Reporté</Badge>
          <Badge variant="destructive">Annulé</Badge>
        </div>
      </Showcase>

      <Showcase
        title="Cartes"
        note="Brique de composition la plus utilisée : vignette de match, fiche de club, panneau de statistiques."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <Card interactive>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>FC Saint-Denis</CardTitle>
                  <CardDescription>Football · Île-de-France</CardDescription>
                </div>
                <Avatar>
                  <AvatarFallback>{initials('FC Saint-Denis')}</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Carte interactive : elle réagit au survol comme au focus clavier.
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant="brand">Sénior A</Badge>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Surface flottante</CardTitle>
              <CardDescription>Pour les éléments mis en avant.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                En thème sombre, l’élévation passe par un liseré clair plutôt que par une ombre
                noire, invisible sur fond sombre.
              </p>
            </CardContent>
          </Card>

          <Card variant="brand">
            <CardHeader>
              <CardTitle>Bordure dégradée</CardTitle>
              <CardDescription>Offre recommandée, plan mis en avant.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Obtenue par pseudo-élément : `border-image` ne suit pas les coins arrondis.
              </p>
            </CardContent>
          </Card>
        </div>
      </Showcase>

      <Showcase
        title="Formulaires"
        note="Chaque champ est lié à son étiquette par id/htmlFor. L’état d’erreur passe par aria-invalid, jamais par la seule couleur (WCAG 1.4.1)."
      >
        <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ds-club" required>
              Nom du club
            </Label>
            <Input id="ds-club" placeholder="FC Saint-Denis" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ds-email">Adresse email</Label>
            <Input id="ds-email" type="email" placeholder="coach@club.fr" autoComplete="email" />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="ds-error">Champ en erreur</Label>
            <Input id="ds-error" invalid defaultValue="fc paris" aria-describedby="ds-error-msg" />
            <p id="ds-error-msg" className="text-xs text-destructive">
              Un slug ne contient que des minuscules, des chiffres et des tirets.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="ds-story">Récit du match</Label>
            <Textarea id="ds-story" rows={3} placeholder="Racontez le match…" />
          </div>

          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch id="ds-notify" checked={notifications} onCheckedChange={setNotifications} />
            <Label htmlFor="ds-notify">Alertes de match</Label>
          </div>
        </div>
      </Showcase>

      <Showcase
        title="Surcouches"
        note="Toutes construites sur Radix : piège de focus, restauration du focus, fermeture par Échap et inertie du fond sont garantis."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Ouvrir un dialogue</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un club</DialogTitle>
                <DialogDescription>
                  Le focus est piégé dans le dialogue, et revient au déclencheur à la fermeture.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ds-dialog-name">Nom</Label>
                <Input id="ds-dialog-name" placeholder="FC Saint-Denis" />
              </div>
              <DialogFooter>
                <Button variant="ghost">Annuler</Button>
                <Button variant="gradient">Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Menu déroulant</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Mes clubs</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Se déconnecter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Partager">
                <Share2 aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Partager le match</TooltipContent>
          </Tooltip>
        </div>
      </Showcase>

      <Showcase
        title="Navigation"
        note="Radix implémente le motif ARIA « tabs » : flèches directionnelles, Home/Fin et association aria-controls entre chaque onglet et son panneau."
      >
        <Tabs defaultValue="resume" className="max-w-2xl">
          <TabsList>
            <TabsTrigger value="resume">Résumé</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="compo">Composition</TabsTrigger>
          </TabsList>
          <TabsContent value="resume">
            <p className="text-sm text-muted-foreground">
              Le panneau actif apparaît en fondu. Naviguez avec les flèches du clavier.
            </p>
          </TabsContent>
          <TabsContent value="stats">
            <p className="text-sm text-muted-foreground">Possession, tirs, corners, cartons.</p>
          </TabsContent>
          <TabsContent value="compo">
            <p className="text-sm text-muted-foreground">Titulaires, remplaçants, staff.</p>
          </TabsContent>
        </Tabs>
      </Showcase>

      <Showcase
        title="Avatars"
        note="Radix gère le repli si l’image échoue : indispensable pour des photos téléversées par les utilisateurs."
      >
        <div className="flex flex-wrap items-end gap-4">
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
            <Avatar key={size} size={size}>
              <AvatarFallback>{initials('Amélie Dubois')}</AvatarFallback>
            </Avatar>
          ))}
          <Avatar size="lg" ring="brand">
            <AvatarFallback>MB</AvatarFallback>
          </Avatar>
          <Avatar size="lg" ring="live">
            <AvatarFallback>LP</AvatarFallback>
          </Avatar>
        </div>
      </Showcase>

      <Showcase
        title="États de chargement"
        note="Le squelette reproduit la forme du contenu à venir pour éviter le décalage de mise en page — un des Core Web Vitals que Matchly s’engage à tenir."
      >
        <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
          <div aria-busy className="flex flex-col gap-3">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="flex items-center gap-4">
            <Spinner label="Chargement des matchs" className="size-8 text-primary" />
            <Separator orientation="vertical" className="h-10" />
            <p className="text-sm text-muted-foreground">Indicateur indéterminé.</p>
          </div>
        </div>
      </Showcase>
    </Container>
  );
}
