import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePublicAppointmentDto {
  @IsString()
  petId: string;

  @IsString()
  serviceId: string;

  @IsDateString()
  scheduledDate: string;

  @IsString()
  scheduledTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
