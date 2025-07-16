import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { UploadImageResponseDto } from './dto/upload-image.dto';

@Injectable()
export class UploadService {
  private readonly uploadPath = 'uploads/images';

  constructor() {
    // Criar diretório se não existir
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadImage(file: Express.Multer.File, category?: string): Promise<UploadImageResponseDto> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // Validar se é uma imagem
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Apenas arquivos de imagem são permitidos');
    }

    // Validar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Tamanho máximo: 5MB');
    }

    // Gerar nome único para o arquivo
    const fileExtension = extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    
    // Definir caminho baseado na categoria
    const categoryPath = category ? path.join(this.uploadPath, category) : this.uploadPath;
    
    // Criar diretório da categoria se não existir
    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath, { recursive: true });
    }

    const filePath = path.join(categoryPath, filename);
    
    try {
      // Salvar arquivo
      fs.writeFileSync(filePath, file.buffer);
      
      // Retornar informações do arquivo
      const response: UploadImageResponseDto = {
        filename,
        originalname: file.originalname,
        path: `/upload/image${category ? `/${category}` : ''}/${filename}`,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/images${category ? `/${category}` : ''}/${filename}`
      };

      return response;
    } catch (error) {
      throw new BadRequestException('Erro ao salvar arquivo');
    }
  }

  async deleteImage(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      throw new BadRequestException('Erro ao deletar arquivo');
    }
  }

  getImageUrl(filename: string, category?: string): string {
    return `/uploads/images${category ? `/${category}` : ''}/${filename}`;
  }
}
