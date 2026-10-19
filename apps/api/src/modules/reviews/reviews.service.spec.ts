import { BadRequestException, ConflictException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  const prisma = {
    tutor: { findUnique: jest.fn() },
    appointment: { findFirst: jest.fn() },
    businessReview: { create: jest.fn(), aggregate: jest.fn() },
  } as any;
  const service = new ReviewsService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.tutor.findUnique.mockResolvedValue({ id: 'tutor-a' });
    prisma.appointment.findFirst.mockResolvedValue({ id: 'appointment-a', businessId: 'business-a' });
    prisma.businessReview.create.mockResolvedValue({ id: 'review-a', rating: 5, comment: 'Ótimo', createdAt: new Date() });
    prisma.businessReview.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: 2 });
  });

  it('creates a review for a completed appointment owned by the tutor and recalculates the average', async () => {
    const result = await service.createForAppointment('user-a', 'appointment-a', { rating: 5, comment: ' Ótimo ' });
    expect(prisma.appointment.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tutorId: 'tutor-a', status: 'COMPLETED', scheduledDate: { lte: expect.any(Date) } }) }));
    expect(prisma.businessReview.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ businessId: 'business-a', tutorId: 'tutor-a', appointmentId: 'appointment-a', rating: 5, comment: 'Ótimo' }) }));
    expect(result.summary).toEqual({ averageRating: 4.5, totalReviews: 2 });
  });

  it('blocks a tutor without a completed appointment for that business', async () => {
    prisma.appointment.findFirst.mockResolvedValue(null);
    await expect(service.createForAppointment('user-b', 'appointment-a', { rating: 4 })).rejects.toThrow(BadRequestException);
    expect(prisma.businessReview.create).not.toHaveBeenCalled();
  });

  it('blocks duplicate reviews for the same appointment', async () => {
    prisma.businessReview.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.createForAppointment('user-a', 'appointment-a', { rating: 5 })).rejects.toThrow(ConflictException);
  });
});
