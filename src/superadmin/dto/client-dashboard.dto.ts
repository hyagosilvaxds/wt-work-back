export class ClientDashboardDto {
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
  instructorName: string;
  className?: string;
  observations?: string | null;
}
