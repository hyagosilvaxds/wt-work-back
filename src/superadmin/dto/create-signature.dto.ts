import { IsString } from 'class-validator';

export class CreateSignatureDto {
  @IsString()
  instructorId: string;

  @IsString()
  imagePath: string;
}

export class UpdateSignatureDto {
  @IsString()
  imagePath: string;
}
