import { IsString, IsOptional, IsBoolean, IsDateString, IsEmail, MinLength, IsUUID } from 'class-validator';

export class CreateStudentDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  name: string;

  @IsString()
  @MinLength(11)
  cpf: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  education?: string;

  // Endereço
  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  addressNumber?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  // Contatos
  @IsOptional()
  @IsString()
  landlineAreaCode?: string;

  @IsOptional()
  @IsString()
  landlineNumber?: string;

  @IsOptional()
  @IsString()
  mobileAreaCode?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // Informações adicionais
  @IsOptional()
  @IsString()
  observations?: string;

  // Relacionamento com cliente (empresa)
  @IsOptional()
  @IsString()
  clientId?: string;
}

export class PatchStudentDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(11)
  cpf?: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  education?: string;

  // Endereço
  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  addressNumber?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  // Contatos
  @IsOptional()
  @IsString()
  landlineAreaCode?: string;

  @IsOptional()
  @IsString()
  landlineNumber?: string;

  @IsOptional()
  @IsString()
  mobileAreaCode?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // Informações adicionais
  @IsOptional()
  @IsString()
  observations?: string;

  // Relacionamento com cliente (empresa)
  @IsOptional()
  @IsString()
  @IsUUID()
  clientId?: string;
}
