import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, query?: any) {
    const { date, status, professionalId, petId, page = 1, limit = 50 } = query || {};
    const where: any = { businessId };

    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      const startDate = new Date(year, month - 1, day);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(year, month - 1, day);
      endDate.setHours(23, 59, 59, 999);
      where.scheduledDate = { gte: startDate, lte: endDate };
    }
    if (status) where.status = status;
    if (professionalId) where.professionalId = professionalId;
    if (petId) where.petId = petId;

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          tutor: { select: { id: true, name: true, phone: true } },
          pet: { select: { id: true, name: true, species: true, breed: true, photoUrl: true } },
          service: true,
          professional: { select: { id: true, name: true, color: true } },
        },
        orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { data: appointments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, businessId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, businessId },
      include: {
        tutor: true,
        pet: true,
        service: true,
        professional: true,
        medicalRecords: true,
        vaccineRecords: true,
      },
    });
    if (!appointment) throw new NotFoundException('Agendamento nao encontrado');
    return appointment;
  }

  async findAllForTutor(userId: string) {
    const tutor = await this.prisma.tutor.findUnique({ where: { userId } });
    if (!tutor) throw new NotFoundException('Tutor nao encontrado');

    return this.prisma.appointment.findMany({
      where: {
        tutorId: tutor.id,
        pet: { tutorId: tutor.id },
      },
      include: {
        business: { select: { name: true, slug: true, logoUrl: true } },
        service: { select: { name: true } },
        pet: { select: { name: true, species: true, photoUrl: true } },
        review: { select: { id: true, rating: true } },
      },
      orderBy: [{ scheduledDate: 'desc' }, { scheduledTime: 'desc' }],
    });
  }

  async cancelForTutor(id: string, userId: string) {
    const tutor = await this.prisma.tutor.findUnique({ where: { userId } });
    if (!tutor) throw new NotFoundException('Tutor nao encontrado');

    const appointment = await this.prisma.appointment.findFirst({
      where: { id, tutorId: tutor.id, pet: { tutorId: tutor.id } },
    });
    if (!appointment) throw new NotFoundException('Agendamento nao encontrado');
    if (!['SCHEDULED', 'CONFIRMED'].includes(appointment.status)) {
      throw new BadRequestException('Este agendamento nao pode mais ser cancelado');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
      include: {
        business: { select: { name: true, slug: true } },
        service: { select: { name: true } },
        pet: { select: { name: true } },
      },
    });
  }

  async create(businessId: string, data: CreateAppointmentDto) {
    const [tutor, pet, service, professional] = await Promise.all([
      this.prisma.tutor.findFirst({ where: { id: data.tutorId, businessId } }),
      this.prisma.pet.findFirst({ where: { id: data.petId, businessId, isActive: true } }),
      this.prisma.service.findFirst({ where: { id: data.serviceId, businessId, isActive: true } }),
      this.prisma.user.findFirst({ where: { id: data.professionalId, businessId, isActive: true } }),
    ]);
    if (!tutor) throw new BadRequestException('Tutor nao encontrado');
    if (!pet) throw new BadRequestException('Pet nao encontrado');
    if (pet.tutorId !== tutor.id) throw new BadRequestException('O pet nao pertence ao tutor selecionado');
    if (!service) throw new BadRequestException('Servico nao encontrado');
    if (!professional) throw new BadRequestException('Profissional nao encontrado');

    return this.prisma.appointment.create({
      data: {
        businessId,
        tutorId: tutor.id,
        petId: pet.id,
        serviceId: service.id,
        professionalId: professional.id,
        appointmentType: data.appointmentType,
        scheduledDate: new Date(data.scheduledDate),
        scheduledTime: data.scheduledTime,
        notes: data.notes,
        duration: service.duration,
        price: service.price,
        finalPrice: service.price,
      },
      include: { tutor: true, pet: true, service: true, professional: true },
    });
  }

  async update(id: string, businessId: string, data: UpdateAppointmentDto) {
    const appointment = await this.findOne(id, businessId);
    const tutorId = data.tutorId || appointment.tutorId;
    const petId = data.petId || appointment.petId;

    const [tutor, pet, service, professional] = await Promise.all([
      this.prisma.tutor.findFirst({ where: { id: tutorId, businessId } }),
      this.prisma.pet.findFirst({ where: { id: petId, businessId, isActive: true } }),
      data.serviceId
        ? this.prisma.service.findFirst({ where: { id: data.serviceId, businessId, isActive: true } })
        : Promise.resolve(null),
      data.professionalId
        ? this.prisma.user.findFirst({ where: { id: data.professionalId, businessId, isActive: true } })
        : Promise.resolve(null),
    ]);
    if (!tutor) throw new BadRequestException('Tutor nao encontrado');
    if (!pet || pet.tutorId !== tutor.id) throw new BadRequestException('Pet invalido para o tutor selecionado');
    if (data.serviceId && !service) throw new BadRequestException('Servico nao encontrado');
    if (data.professionalId && !professional) throw new BadRequestException('Profissional nao encontrado');

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        ...(data.scheduledDate && { scheduledDate: new Date(data.scheduledDate) }),
        ...(service && { duration: service.duration, price: service.price, finalPrice: service.price }),
      },
      include: { tutor: true, pet: true, service: true, professional: true },
    });
  }

  async updateStatus(id: string, businessId: string, status: string) {
    const appointment = await this.findOne(id, businessId);
    const updateData: any = { status };

    switch (status) {
      case 'CONFIRMED':
        updateData.confirmedAt = new Date();
        break;
      case 'IN_PROGRESS':
        updateData.startedAt = new Date();
        break;
      case 'COMPLETED':
        updateData.completedAt = new Date();
        break;
      case 'CANCELLED':
        updateData.cancelledAt = new Date();
        break;
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
    });
  }

  async getCalendar(businessId: string, startDate: string, endDate: string) {
    return this.prisma.appointment.findMany({
      where: {
        businessId,
        scheduledDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        pet: { select: { id: true, name: true, species: true } },
        service: { select: { id: true, name: true, category: true } },
        professional: { select: { id: true, name: true, color: true } },
      },
      orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
    });
  }

  async getAvailableSlots(businessId: string, date: string, serviceId: string, professionalId?: string) {
    const service = await this.prisma.service.findFirst({ where: { id: serviceId, businessId, isActive: true } });
    if (!service) throw new BadRequestException('Servico nao encontrado');

    const targetDate = new Date(date);
    const appointments = await this.prisma.appointment.findMany({
      where: {
        businessId,
        scheduledDate: targetDate,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        ...(professionalId && { professionalId }),
      },
    });

    const slots: string[] = [];
    const startHour = 8;
    const endHour = 18;
    const interval = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const isOccupied = appointments.some((apt) => apt.scheduledTime === time);
        if (!isOccupied) slots.push(time);
      }
    }

    return slots;
  }
}
