import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TutorAppointmentsController } from './tutor-appointments.controller';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  controllers: [AppointmentsController, TutorAppointmentsController],
  imports: [ReviewsModule],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
