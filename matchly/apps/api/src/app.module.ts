import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { type AppConfig, validateConfig } from './common/config/configuration';
import { AllExceptionsFilter } from './common/http/all-exceptions.filter';
import { LoggingInterceptor } from './common/http/logging.interceptor';
import { RequestIdMiddleware } from './common/http/request-id.middleware';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

/**
 * Module racine.
 *
 * Il n'assemble que des modules et des fournisseurs transverses : aucune règle
 * métier ne doit remonter ici. Chaque domaine à venir — clubs, compétitions,
 * matchs, streaming — sera un module autonome sous `modules/`, importable et
 * testable isolément.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // La validation Zod s'exécute avant l'instanciation du moindre module.
      validate: validateConfig,
      cache: true,
      // La racine du monorepo porte le `.env` partagé avec Docker Compose.
      envFilePath: ['.env', '../../.env'],
    }),

    /**
     * Limitation de débit globale.
     *
     * Première ligne de défense contre le grattage automatisé et le bourrage
     * d'identifiants. Le compteur est en mémoire au Sprint 0 : correct pour une
     * instance unique, insuffisant dès qu'il y en a plusieurs, où chaque
     * instance appliquerait son propre quota. Le stockage Redis viendra avec la
     * mise à l'échelle horizontale.
     */
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        throttlers: [
          {
            ttl: config.get('API_RATE_LIMIT_TTL_MS', { infer: true }),
            limit: config.get('API_RATE_LIMIT_MAX', { infer: true }),
          },
        ],
      }),
    }),

    PrismaModule,
    RedisModule,
    HealthModule,
    RealtimeModule,
  ],
  providers: [
    /**
     * Filtre global : garantit que toute erreur sort dans l'enveloppe partagée.
     * Déclaré via `APP_FILTER` plutôt qu'avec `app.useGlobalFilters` pour qu'il
     * bénéficie de l'injection de dépendances.
     */
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Appliqué à toutes les routes : l'identifiant de corrélation doit exister
    // avant tout autre traitement, y compris pour les requêtes qui échouent.
    consumer.apply(RequestIdMiddleware).forRoutes('*path');
  }
}

export { ThrottlerGuard };
