import { Module } from '@nestjs/common';
import { CampanhaService } from './campanha.service';
import { CampanhaController } from './campanha.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CampanhaService, PrismaService],
  controllers: [CampanhaController]
})
export class CampanhaModule {}
