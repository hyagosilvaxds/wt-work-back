import { IsArray, IsNotEmpty, IsString, ArrayMinSize, IsUUID } from 'class-validator';

export class AddStudentsToClassDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'É necessário fornecer pelo menos um ID de estudante' })
  @IsString({ each: true, message: 'Cada ID deve ser uma string válida' })
  @IsNotEmpty({ each: true, message: 'IDs não podem estar vazios' })
  studentIds: string[];
}
