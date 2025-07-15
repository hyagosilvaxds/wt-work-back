export class CreateClassDto {
  trainingId: string;
  instructorId: string;
  startDate: Date;
  endDate: Date;
  type?: string;
  recycling?: string;
  status?: string;
  location?: string;
  clientId?: string;
  observations?: string;
}

export class PatchClassDto {
  trainingId?: string;
  instructorId?: string;
  startDate?: Date;
  endDate?: Date;
  type?: string;
  recycling?: string;
  status?: string;
  location?: string;
  clientId?: string;
  observations?: string;
}
