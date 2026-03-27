import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global() makes PrismaService injectable everywhere without re-importing
 * this module in every feature module — idiomatic NestJS for infrastructure services.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
