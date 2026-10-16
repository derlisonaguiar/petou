import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentType } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString()
  tutorId: string;

  @IsString()
  petId: string;

  @IsString()
  serviceId: string;

  @IsString()
  professionalId: string;

  @IsEnum(AppointmentType)
  appointmentType: AppointmentType;

  @IsDateString()
  scheduledDate: string;

  @IsString()
  scheduledTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
