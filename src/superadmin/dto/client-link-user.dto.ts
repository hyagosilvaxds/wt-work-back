import { IsString, IsEmail, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class LinkUserToClientDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
