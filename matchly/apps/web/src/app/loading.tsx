import { Container, Section, Skeleton } from '@matchly/ui';

/**
 * État de chargement par défaut des routes.
 *
 * La forme reproduit celle d'une page type — titre, accroche, grille de
 * cartes — pour que le passage au contenu réel ne déplace rien. Un simple
 * spinner centré ferait sauter la mise en page à l'arrivée du contenu et
 * dégraderait le CLS.
 */
export default function Loading() {
  return (
    <Section spacing="lg" aria-busy aria-label="Chargement de la page">
      <Container>
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="mt-2 h-5 w-full max-w-md" />
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-2xl" />
          ))}
        </div>
      </Container>
    </Section>
  );
}
