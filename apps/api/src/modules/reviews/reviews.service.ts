import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessReviewDto } from './dto/create-business-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}
  async createForAppointment(userId: string, appointmentId: string, dto: CreateBusinessReviewDto) {
    const tutor = await this.prisma.tutor.findUnique({ where: { userId }, select: { id: true } });
    if (!tutor) throw new NotFoundException('Tutor não encontrado.');
    const appointment = await this.prisma.appointment.findFirst({ where: { id: appointmentId, tutorId: tutor.id, status: 'COMPLETED', scheduledDate: { lte: new Date() } }, select: { id: true, businessId: true } });
    if (!appointment) throw new BadRequestException('Apenas atendimentos concluídos e já realizados podem ser avaliados.');
    try {
      const review = await this.prisma.businessReview.create({ data: { businessId: appointment.businessId, tutorId: tutor.id, appointmentId: appointment.id, rating: dto.rating, comment: dto.comment?.trim() || null }, select: { id: true, rating: true, comment: true, createdAt: true } });
      return { review, summary: await this.getBusinessSummary(appointment.businessId) };
    } catch (error: any) {
      if (error?.code === 'P2002') throw new ConflictException('Este atendimento já foi avaliado.');
      throw error;
    }
  }
  async getBusinessSummary(businessId: string) {
    const stats = await this.prisma.businessReview.aggregate({ where: { businessId }, _avg: { rating: true }, _count: true });
    return { averageRating: Number(stats._avg.rating || 0), totalReviews: stats._count };
  }
}
