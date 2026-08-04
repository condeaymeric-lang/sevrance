import { Global, Module } from '@nestjs/common';

import { RedisService } from './redis.service';

/** Module Redis, global pour les mêmes raisons que {@link PrismaModule}. */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
