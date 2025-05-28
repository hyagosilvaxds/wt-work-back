import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';
import { CampanhaModule } from './campanha/campanha.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, // Torna as variáveis de ambiente acessíveis globalmente
}),
AuthModule,
DashboardModule,
AdminModule,
CampanhaModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
