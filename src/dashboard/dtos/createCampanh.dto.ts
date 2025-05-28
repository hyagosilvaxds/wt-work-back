import { IsString, IsNotEmpty, IsNumber, IsDateString, IsEmail, IsOptional } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  imagem: string;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsNumber()
  @IsNotEmpty()
  meta: number;

  @IsDateString()
  @IsNotEmpty()
  dataFim: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsOptional()
  historia?: string;

  @IsString()
  @IsNotEmpty()
  tipoOrganizador: string;

  @IsString()
  @IsNotEmpty()
  nomeOrganizador: string;

  @IsString()
  @IsNotEmpty()
  documentoOrganizador: string;

  @IsEmail()
  @IsNotEmpty()
  emailOrganizador: string;

  @IsString()
  @IsNotEmpty()
  telefoneOrganizador: string;
}

export type Campaign = {
  titulo: string;
  meta: number;
  imagem: string;
  dataFim: string;
  descricao: string;
  historia: string;
  tipoOrganizador: 'individual' | 'organizacao';
  nomeOrganizador: string;
  documentoOrganizador: string;
  emailOrganizador: string;
  telefoneOrganizador: string;
  userId: string;
};