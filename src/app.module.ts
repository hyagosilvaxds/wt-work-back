import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { SuperadminModule } from './superadmin/superadmin.module';
import { UploadModule } from './upload/upload.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, // Torna as variáveis de ambiente acessíveis globalmente
}),
AuthModule,
SuperadminModule,
UploadModule,
],
  providers: [PrismaService],
  exports: [PrismaService], // Exporta PrismaService para ser usado em outros módulos
})
export class AppModule {}
