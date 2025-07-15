export class CreateLessonAttendanceDto {
  lessonId: string;
  studentId: string;
  status?: string;
  observations?: string;
}

export class PatchLessonAttendanceDto {
  lessonId?: string;
  studentId?: string;
  status?: string;
  observations?: string;
}
