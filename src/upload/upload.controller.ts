import { 
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  Body, 
  BadRequestException,
  Get,
  Param,
  Delete,
  Res,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadImageDto, UploadImageResponseDto } from './dto/upload-image.dto';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto
  ): Promise<UploadImageResponseDto> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    return this.uploadService.uploadImage(file, uploadImageDto.category);
  }

  @Post('images')
  @UseInterceptors(FileInterceptor('files'))
  async uploadMultipleImages(
    @UploadedFile() files: Express.Multer.File[],
    @Body() uploadImageDto: UploadImageDto
  ): Promise<UploadImageResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    const uploadPromises = files.map(file => 
      this.uploadService.uploadImage(file, uploadImageDto.category)
    );

    return Promise.all(uploadPromises);
  }

  @Get('image/:category/:filename')
  async getImage(
    @Param('category') category: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    const filePath = `uploads/images/${category}/${filename}`;
    
    if (!fs.existsSync(filePath)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Arquivo não encontrado'
      });
    }

    return res.sendFile(filePath, { root: '.' });
  }

  @Get('image/:filename')
  async getImageWithoutCategory(
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    const filePath = `uploads/images/${filename}`;
    
    if (!fs.existsSync(filePath)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Arquivo não encontrado'
      });
    }

    return res.sendFile(filePath, { root: '.' });
  }

  @Delete('image')
  async deleteImage(
    @Body() body: { path: string }
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.uploadService.deleteImage(body.path);
    
    return {
      success,
      message: success ? 'Arquivo deletado com sucesso' : 'Arquivo não encontrado'
    };
  }
}
