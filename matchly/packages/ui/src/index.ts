/**
 * `@matchly/ui` — Design System Matchly.
 *
 * Le paquet est consommé en TypeScript source, transpilé par l'application hôte
 * (`transpilePackages` côté Next). Aucune étape de build intermédiaire :
 * les directives `'use client'` traversent donc intactes, là où un pré-build
 * les fait sauter selon l'outil et transforme silencieusement un composant
 * interactif en composant serveur.
 *
 * Les styles s'importent séparément :
 *   `@import '@matchly/ui/tokens.css';`
 */

// --- Utilitaires -----------------------------------------------------------
export { cn } from './lib/cn';
export { initials } from './lib/initials';

/**
 * Variantes des composants clients.
 *
 * Exportées depuis un module neutre : voir `src/variants.ts` pour la raison.
 * Un Server Component peut donc appeler `buttonVariants(...)` pour styler un
 * lien sans franchir de frontière client.
 */
export { avatarVariants, buttonVariants, sheetVariants } from './variants';

// --- Primitives ------------------------------------------------------------
export { Avatar, AvatarFallback, AvatarImage } from './components/avatar';
export { Badge, badgeVariants } from './components/badge';
export { Button } from './components/button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
} from './components/card';
export { Container, containerVariants, Section, sectionVariants } from './components/container';
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './components/dialog';
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './components/dropdown-menu';
export { Input } from './components/input';
export { Label } from './components/label';
export { formatViewerCount, LiveBadge } from './components/live-badge';
export { Logo, LogoMark } from './components/logo';
export { ScrollArea, ScrollBar } from './components/scroll-area';
export { Separator } from './components/separator';
export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './components/sheet';
export { Skeleton } from './components/skeleton';
export { Spinner } from './components/spinner';
export { Switch } from './components/switch';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs';
export { Textarea } from './components/textarea';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/tooltip';
export { VisuallyHidden } from './components/visually-hidden';

// --- Types -----------------------------------------------------------------
export type { AvatarProps } from './components/avatar';
export type { BadgeProps } from './components/badge';
export type { ButtonProps } from './components/button';
export type { CardProps } from './components/card';
export type { ContainerProps, SectionProps } from './components/container';
export type { DialogContentProps } from './components/dialog';
export type { DropdownMenuItemProps } from './components/dropdown-menu';
export type { InputProps } from './components/input';
export type { LabelProps } from './components/label';
export type { LiveBadgeProps } from './components/live-badge';
export type { LogoMarkProps, LogoProps } from './components/logo';
export type { SheetContentProps } from './components/sheet';
export type { SpinnerProps } from './components/spinner';
export type { TextareaProps } from './components/textarea';
