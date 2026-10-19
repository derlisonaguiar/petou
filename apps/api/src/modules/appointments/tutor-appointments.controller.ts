import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TutorContextGuard } from '../auth/guards/tutor-context.guard';
import { AppointmentsService } from './appointments.service';
import { ReviewsService } from '../reviews/reviews.service';
import { CreateBusinessReviewDto } from '../reviews/dto/create-business-review.dto';

@ApiTags('tutor-appointments')
@Controller('tutor/appointments')
@UseGuards(JwtAuthGuard, TutorContextGuard)
@ApiBearerAuth()
export class TutorAppointmentsController {
  constructor(private appointmentsService: AppointmentsService, private reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar agendamentos do tutor autenticado' })
  findAll(@Request() req: any) {
    return this.appointmentsService.findAllForTutor(req.user.sub);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancelar agendamento do tutor autenticado' })
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.appointmentsService.cancelForTutor(id, req.user.sub);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Avaliar um atendimento concluído' })
  createReview(@Param('id') id: string, @Body() dto: CreateBusinessReviewDto, @Request() req: any) {
    return this.reviewsService.createForAppointment(req.user.sub, id, dto);
  }
}
