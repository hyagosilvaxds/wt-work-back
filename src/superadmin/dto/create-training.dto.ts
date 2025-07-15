export class CreateTrainingDto {
  title: string;
  description?: string;
  durationHours: number;
  isActive?: boolean;
  validityDays?: number;
}
