import { describe, expect, it } from 'vitest';

import { validateConfig } from './configuration';

/** Environnement minimal valide : seules les variables sans défaut y figurent. */
const MINIMAL = {
  DATABASE_URL: 'postgresql://matchly:pass@localhost:5432/matchly',
  REDIS_URL: 'redis://localhost:6379',
};

describe('validateConfig', () => {
  it('accepte un environnement minimal et applique les valeurs par défaut', () => {
    const config = validateConfig({ ...MINIMAL });

    expect(config.NODE_ENV).toBe('development');
    expect(config.API_PORT).toBe(4000);
    expect(config.API_GLOBAL_PREFIX).toBe('api');
  });

  it('interrompt le démarrage si DATABASE_URL manque', () => {
    // Une API qui démarre sans base accepterait du trafic pour échouer ensuite
    // à la première requête : l'échec doit être immédiat et visible.
    expect(() => validateConfig({ REDIS_URL: MINIMAL.REDIS_URL })).toThrowError(/DATABASE_URL/);
  });

  it('interrompt le démarrage si REDIS_URL manque', () => {
    expect(() => validateConfig({ DATABASE_URL: MINIMAL.DATABASE_URL })).toThrowError(/REDIS_URL/);
  });

  it('convertit le port reçu en chaîne', () => {
    // `process.env` ne contient que des chaînes.
    expect(validateConfig({ ...MINIMAL, API_PORT: '8080' }).API_PORT).toBe(8080);
  });

  it('refuse un port hors des bornes TCP', () => {
    expect(() => validateConfig({ ...MINIMAL, API_PORT: '70000' })).toThrowError();
    expect(() => validateConfig({ ...MINIMAL, API_PORT: '0' })).toThrowError();
  });

  it('refuse un NODE_ENV inconnu', () => {
    expect(() => validateConfig({ ...MINIMAL, NODE_ENV: 'staging' })).toThrowError();
  });

  describe('API_CORS_ORIGINS', () => {
    it('découpe la liste et élague les espaces', () => {
      const config = validateConfig({
        ...MINIMAL,
        API_CORS_ORIGINS: 'https://matchly.app, https://www.matchly.app',
      });

      expect(config.API_CORS_ORIGINS).toEqual(['https://matchly.app', 'https://www.matchly.app']);
    });

    it('ignore les entrées vides d’une liste mal formée', () => {
      const config = validateConfig({ ...MINIMAL, API_CORS_ORIGINS: 'https://a.app,,  ,' });

      expect(config.API_CORS_ORIGINS).toEqual(['https://a.app']);
    });

    it('autorise le front local par défaut', () => {
      expect(validateConfig({ ...MINIMAL }).API_CORS_ORIGINS).toEqual(['http://localhost:3000']);
    });
  });

  describe('API_SWAGGER_ENABLED', () => {
    it('n’active la documentation que sur la chaîne exacte "true"', () => {
      expect(validateConfig({ ...MINIMAL, API_SWAGGER_ENABLED: 'true' }).API_SWAGGER_ENABLED).toBe(
        true,
      );
      // Toute autre valeur désactive : sur un réglage qui expose la surface
      // d'API publiquement, le défaut sûr est de refuser.
      expect(validateConfig({ ...MINIMAL, API_SWAGGER_ENABLED: 'false' }).API_SWAGGER_ENABLED).toBe(
        false,
      );
      expect(validateConfig({ ...MINIMAL, API_SWAGGER_ENABLED: 'oui' }).API_SWAGGER_ENABLED).toBe(
        false,
      );
    });
  });

  it('signale tous les champs fautifs, pas seulement le premier', () => {
    try {
      validateConfig({ API_PORT: 'abc' });
      expect.unreachable('la validation aurait dû échouer');
    } catch (error) {
      const message = (error as Error).message;

      expect(message).toContain('DATABASE_URL');
      expect(message).toContain('REDIS_URL');
      expect(message).toContain('API_PORT');
    }
  });
});
