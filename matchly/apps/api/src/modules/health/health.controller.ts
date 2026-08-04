import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  type HealthIndicatorResult,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';

import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

/**
 * Sondes de santé.
 *
 * Deux points distincts, parce que Kubernetes et les équilibreurs de charge
 * posent deux questions différentes :
 *
 *   - `/live` (liveness) : « le processus est-il vivant ? ». Il ne teste
 *     aucune dépendance. Y inclure la base serait une faute : une coupure
 *     PostgreSQL ferait redémarrer en boucle des instances parfaitement saines,
 *     transformant une panne de base en panne totale.
 *
 *   - `/ready` (readiness) : « puis-je router du trafic ici ? ». Il teste les
 *     dépendances. Un échec retire l'instance du pool sans la tuer, et elle y
 *     revient d'elle-même quand la dépendance se rétablit.
 */
@ApiTags('Santé')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get('live')
  @ApiOperation({
    summary: 'Sonde de vivacité',
    description: 'Répond dès que le processus tourne. Ne teste aucune dépendance.',
  })
  live(): { status: 'ok'; uptime: number; timestamp: string } {
    return {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Sonde de disponibilité',
    description: 'Vérifie PostgreSQL, Redis et la mémoire du processus.',
  })
  ready() {
    return this.health.check([
      () => this.prismaIndicator.pingCheck('postgres', this.prisma),
      () => this.checkRedis(),
      // Alerte avant l'échec : au-delà de 512 Mio de tas, une fuite est probable.
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
    ]);
  }

  /** Indicateur Redis. Terminus n'en fournit pas pour ioredis. */
  private async checkRedis(): Promise<HealthIndicatorResult> {
    const healthy = await this.redis.isHealthy();

    return { redis: { status: healthy ? 'up' : 'down' } };
  }
}
