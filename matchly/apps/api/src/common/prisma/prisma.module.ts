import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * Module d'accès aux données.
 *
 * Marqué `@Global` : le pool de connexions est une ressource unique du
 * processus. Le déclarer globalement évite d'importer `PrismaModule` dans
 * chacun des dizaines de modules métier à venir, sans créer pour autant
 * plusieurs pools — Nest instancie le fournisseur une seule fois.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
