import { IsEmail, IsOptional, IsString, IsBoolean, MinLength, IsArray } from 'class-validator';

export class CreateInstructorUserDto {
  // Relacionamento com usuário (opcional)
  @IsOptional()
  @IsString()
  userId?: string;

  // Informações básicas
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  corporateName?: string;

  // Tipo de pessoa
  @IsOptional()
  @IsString()
  personType?: string; // FISICA ou JURIDICA

  // Documentos
  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  municipalRegistration?: string;

  @IsOptional()
  @IsString()
  stateRegistration?: string;

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

  // Informações profissionais
  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  // Informações adicionais
  @IsOptional()
  @IsString()
  observations?: string;
}


export class LinkUserToInstructorDto {
  @IsString()
  instructorId: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}