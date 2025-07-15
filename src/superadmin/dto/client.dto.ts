import { IsString, IsOptional, IsBoolean, IsEmail, IsUUID } from 'class-validator';

export class CreateClientDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  corporateName?: string;

  @IsOptional()
  @IsString()
  personType?: string;

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

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

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

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  responsibleName?: string;

  @IsOptional()
  @IsEmail()
  responsibleEmail?: string;

  @IsOptional()
  @IsString()
  responsiblePhone?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class PatchClientDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  corporateName?: string;

  @IsOptional()
  @IsString()
  personType?: string;

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

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

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

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  responsibleName?: string;

  @IsOptional()
  @IsEmail()
  responsibleEmail?: string;

  @IsOptional()
  @IsString()
  responsiblePhone?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
