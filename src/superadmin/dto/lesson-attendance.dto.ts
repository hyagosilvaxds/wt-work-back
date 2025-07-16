import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateLessonAttendanceDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class PatchLessonAttendanceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lessonId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  studentId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
