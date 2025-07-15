export class CreateLessonDto {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status?: string;
  location?: string;
  observations?: string;
  instructorId: string;
  clientId?: string;
  classId?: string;
}

export class PatchLessonDto {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  location?: string;
  observations?: string;
  instructorId?: string;
  clientId?: string;
  classId?: string;
}
