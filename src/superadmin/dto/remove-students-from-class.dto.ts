import { IsArray, IsString, ArrayMinSize, IsUUID } from 'class-validator';

export class RemoveStudentsFromClassDto {
  @IsArray({ message: 'studentsIds deve ser um array' })
  @ArrayMinSize(1, { message: 'É necessário fornecer pelo menos um ID de estudante' })
  @IsString({ each: true, message: 'Cada ID deve ser uma string' })
  studentIds: string[];
}
