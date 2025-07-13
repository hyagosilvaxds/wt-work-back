import { Module } from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { SuperadminController } from './superadmin.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [SuperadminService, PrismaService],
  controllers: [SuperadminController],
  exports: [SuperadminService],
})
export class SuperadminModule {}
