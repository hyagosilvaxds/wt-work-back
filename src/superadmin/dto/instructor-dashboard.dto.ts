export class InstructorDashboardDto {
  totalStudents: number;
  totalClasses: number;
  totalScheduledLessons: number;
  totalCompletedClasses: number;
  scheduledLessons: ScheduledLessonDto[];
}

export class ScheduledLessonDto {
  id: string;
  title: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  location?: string | null;
  status: string;
  className?: string;
  clientName?: string;
  observations?: string | null;
}
