import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import type { AppConfig } from '../config/configuration';

/**
 * Accès à Redis.
 *
 * Redis remplit trois rôles distincts chez Matchly, et c'est pourquoi il est
 * introduit dès le Sprint 0 :
 *   - cache de lecture des classements et des fiches très consultées ;
 *   - bus de publication entre instances Socket.IO, indispensable dès qu'il y a
 *     plus d'un processus — sans lui, deux spectateurs d'un même match connectés
 *     à deux instances différentes ne voient pas les messages l'un de l'autre ;
 *   - compteurs de limitation de débit partagés.
 *
 * La connexion applicative est exposée telle quelle. Le bus pub/sub exigera ses
 * propres connexions dédiées au Sprint 5 : un client Redis en mode abonnement
 * ne peut plus exécuter de commande ordinaire.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;

  constructor(config: ConfigService<AppConfig, true>) {
    this.client = new Redis(config.get('REDIS_URL', { infer: true }), {
      /**
       * Toutes les clés sont préfixées. C'est ce qui permet à plusieurs
       * environnements de partager une instance Redis sans collision, et de
       * purger un environnement entier sans toucher aux autres.
       */
      keyPrefix: config.get('REDIS_KEY_PREFIX', { infer: true }),
      /**
       * Connexion différée : le constructeur ne doit pas ouvrir de socket.
       * `onModuleInit` reste ainsi le seul point où le démarrage peut échouer,
       * et l'échec est rattachable au cycle de vie Nest.
       */
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      // Recul progressif plafonné à 2 s, pour ne pas marteler un Redis en panne.
      retryStrategy: (times) => Math.min(times * 200, 2_000),
      enableOfflineQueue: true,
    });

    this.client.on('error', (error: Error) => {
      this.logger.error(`Erreur Redis : ${error.message}`);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
    this.logger.log('Connexion à Redis établie.');
  }

  async onModuleDestroy(): Promise<void> {
    // `quit` attend la fin des commandes en cours, là où `disconnect` les perd.
    await this.client.quit();
    this.logger.log('Connexion à Redis fermée.');
  }

  /**
   * Vérifie que Redis répond.
   *
   * @returns `true` si le PING aboutit, `false` en cas d'échec.
   */
  async isHealthy(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }
}
