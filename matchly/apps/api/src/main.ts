import 'reflect-metadata';

import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import type { AppConfig } from './common/config/configuration';

/**
 * Démarre l'API Matchly.
 *
 * L'ordre des étapes n'est pas indifférent : Helmet et CORS doivent être posés
 * avant toute route, sinon les premières requêtes servies pendant le démarrage
 * échapperaient à la politique de sécurité.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    // Le corps brut est nécessaire à la vérification des signatures de webhooks
    // (paiement, ingestion MediaMTX) : le JSON reparsé ne correspond plus à
    // l'octet près à ce qui a été signé.
    rawBody: true,
  });

  const config = app.get(ConfigService<AppConfig, true>);

  // --- Sécurité ------------------------------------------------------------
  app.use(
    helmet({
      // La CSP est gérée côté frontend : l'API ne sert pas de HTML.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.enableCors({
    origin: config.get('API_CORS_ORIGINS', { infer: true }),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86_400,
  });

  // --- Routage -------------------------------------------------------------
  const globalPrefix = config.get('API_GLOBAL_PREFIX', { infer: true });
  app.setGlobalPrefix(globalPrefix, {
    // Les sondes restent hors du préfixe versionné : un équilibreur de charge
    // ne doit pas avoir à connaître la version de l'API pour savoir si
    // l'instance est vivante.
    exclude: ['health/live', 'health/ready'],
  });

  /**
   * Versionnage par URI (`/api/v1/...`).
   *
   * Préféré au versionnage par en-tête : une URL versionnée est visible dans
   * les logs, testable au navigateur et cachable telle quelle par Cloudflare.
   */
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Laisse le temps aux requêtes en cours de se terminer avant l'arrêt.
  app.enableShutdownHooks();

  // --- Documentation -------------------------------------------------------
  if (config.get('API_SWAGGER_ENABLED', { infer: true })) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Matchly API')
        .setDescription('API de la plateforme mondiale du sport amateur.')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );

    SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = config.get('API_PORT', { infer: true });
  const host = config.get('API_HOST', { infer: true });

  await app.listen(port, host);

  logger.log(`API démarrée sur http://${host}:${port}/${globalPrefix}/v1`);
  logger.log(`Sondes : /health/live et /health/ready`);
}

void bootstrap();
