import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('concatène les classes simples', () => {
    expect(cn('rounded-lg', 'px-4')).toBe('rounded-lg px-4');
  });

  it('laisse la dernière classe l’emporter en cas de conflit', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('ignore les valeurs falsy', () => {
    expect(cn('base', false, null, undefined, '')).toBe('base');
  });

  it('accepte la forme conditionnelle objet', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active');
  });

  it('permet à une prop className de surcharger le style du composant', () => {
    // Le cas d'usage central : c'est ce qui rend les composants surchargeables.
    expect(cn('bg-primary text-sm', 'bg-destructive')).toBe('text-sm bg-destructive');
  });

  it('fait s’exclure deux dégradés de marque entre eux', () => {
    expect(cn('bg-gradient-brand', 'bg-gradient-brand-soft')).toBe('bg-gradient-brand-soft');
  });

  it('range shadow-glow dans le groupe des ombres', () => {
    expect(cn('shadow-md', 'shadow-glow')).toBe('shadow-glow');
    expect(cn('shadow-glow', 'shadow-sm')).toBe('shadow-sm');
  });

  it('laisse coexister un dégradé et une couleur de fond de repli', () => {
    // Propriétés CSS distinctes : background-image et background-color.
    expect(cn('bg-gradient-brand', 'bg-red-500')).toBe('bg-gradient-brand bg-red-500');
  });

  it('préserve les variantes distinctes', () => {
    // `hover:px-6` ne doit pas écraser `px-4` : les états sont indépendants.
    expect(cn('px-4', 'hover:px-6')).toBe('px-4 hover:px-6');
  });
});
