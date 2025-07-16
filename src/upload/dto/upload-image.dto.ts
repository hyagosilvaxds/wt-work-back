import { IsString, IsOptional } from 'class-validator';

export class UploadImageDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UploadImageResponseDto {
  @IsString()
  filename: string;

  @IsString()
  originalname: string;

  @IsString()
  path: string;

  @IsString()
  mimetype: string;

  size: number;

  @IsString()
  url: string;
}
