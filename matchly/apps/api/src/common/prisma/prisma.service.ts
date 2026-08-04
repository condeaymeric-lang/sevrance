import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../generated/prisma/client';
import type { AppConfig } from '../config/configuration';

/**
 * Accès à la base de données.
 *
 * Le client est branché sur PostgreSQL par l'adaptateur `@prisma/adapter-pg`,
 * qui utilise le pool `pg` standard. Prisma 7 a fait de ce mode le mode
 * nominal : la connexion est ouverte par du code JavaScript que l'on contrôle,
 * plutôt que par un moteur natif opaque. Concrètement, on maîtrise la taille du
 * pool et les délais, et on peut instrumenter la connexion.
 *
 * Le service étend `PrismaClient` plutôt que de l'encapsuler : les modules
 * métier accèdent ainsi directement à `prisma.club.findMany()` sans couche de
 * délégation à maintenir pour chaque modèle.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService<AppConfig, true>) {
    const adapter = new PrismaPg({
      connectionString: config.get('DATABASE_URL', { infer: true }),
      /**
       * Un pool par instance d'API. Vingt connexions suffisent largement pour
       * un service Node mono-thread : au-delà, on épuise le `max_connections`
       * de PostgreSQL bien avant de saturer le serveur applicatif. La montée en
       * charge passe par plus d'instances, pas par un pool plus large.
       */
      max: 20,
      // Referme les connexions inactives pour ne pas immobiliser des sockets.
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

    super({
      adapter,
      log: [
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Connexion à PostgreSQL établie.');
  }

  /**
   * Ferme proprement le pool à l'arrêt.
   *
   * Sans cela, un redéploiement laisse des connexions ouvertes côté PostgreSQL
   * jusqu'à leur expiration : quelques cycles suffisent alors à saturer
   * `max_connections` et à empêcher la nouvelle version de démarrer.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Connexion à PostgreSQL fermée.');
  }
}
