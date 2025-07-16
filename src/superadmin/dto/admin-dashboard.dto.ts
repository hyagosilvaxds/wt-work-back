export class AdminDashboardDto {
  totalStudents: number;
  totalClasses: number;
  totalScheduledLessons: number;
  totalCompletedClasses: number;
  totalInstructors: number;
  totalClients: number;
  totalTrainings: number;
  scheduledLessons: ScheduledLessonDto[];
  recentActivities: RecentActivityDto[];
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
  clientName?: string | null;
  className?: string;
  observations?: string | null;
}

export class RecentActivityDto {
  id: string;
  type: 'CLASS_CREATED' | 'LESSON_CREATED' | 'STUDENT_ENROLLED' | 'TRAINING_COMPLETED';
  description: string;
  createdAt: Date;
  entityId: string;
  entityType: string;
}
