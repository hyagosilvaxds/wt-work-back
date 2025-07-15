import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateClassDto {
  @IsString()
  trainingId: string;

  @IsString()
  instructorId: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  recycling?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class PatchClassDto {
  @IsOptional()
  @IsString()
  trainingId?: string;

  @IsOptional()
  @IsString()
  instructorId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  recycling?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
