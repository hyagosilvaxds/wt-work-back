import { IsString, IsOptional } from 'class-validator';

export class UploadSignatureDto {
  @IsString()
  instructorId: string;
}

export class UpdateSignatureDto {
  @IsString()
  @IsOptional()
  instructorId?: string;
}
