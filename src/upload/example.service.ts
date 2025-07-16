import { Injectable } from '@nestjs/common';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ExampleService {
  constructor(private readonly uploadService: UploadService) {}

  // Exemplo de como usar o serviço de upload em outro serviço
  async saveUserProfileImage(file: Express.Multer.File, userId: string) {
    const uploadResult = await this.uploadService.uploadImage(file, 'profile');
    
    // Aqui você pode salvar o caminho da imagem no banco de dados
    // Por exemplo, usando Prisma:
    // await this.prisma.user.update({
    //   where: { id: userId },
    //   data: { profileImageUrl: uploadResult.url }
    // });
    
    return uploadResult;
  }

  // Exemplo de como deletar uma imagem antiga ao atualizar
  async updateUserProfileImage(file: Express.Multer.File, userId: string, oldImagePath?: string) {
    // Deletar imagem antiga se existir
    if (oldImagePath) {
      await this.uploadService.deleteImage(oldImagePath);
    }
    
    // Fazer upload da nova imagem
    return this.saveUserProfileImage(file, userId);
  }

  // Exemplo de como gerar URL de imagem
  getProfileImageUrl(filename: string): string {
    return this.uploadService.getImageUrl(filename, 'profile');
  }
}
