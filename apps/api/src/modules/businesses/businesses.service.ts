import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { CreatePublicAppointmentDto } from './dto/create-public-appointment.dto';

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
    });
    if (!business) {
      throw new NotFoundException('Negocio nao encontrado');
    }
    return business;
  }

  async findBySlug(slug: string) {
    return this.prisma.business.findUnique({
      where: { slug },
    });
  }

  async findPublicBySlug(slug: string) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        businessTypes: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        logoUrl: true,
        openingHours: true,
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            duration: true,
            price: true,
            acceptedSpecies: true,
            acceptedSizes: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!business) throw new NotFoundException('Negocio nao encontrado');
    return business;
  }

  async createPublicAppointment(slug: string, userId: string, dto: CreatePublicAppointmentDto) {
    const business = await this.prisma.business.findUnique({ where: { slug }, select: { id: true } });
    if (!business) throw new NotFoundException('Negocio nao encontrado');

    const tutor = await this.prisma.tutor.findUnique({ where: { userId } });
    if (!tutor) throw new BadRequestException('Perfil de tutor nao encontrado');

    const [pet, service, professional] = await Promise.all([
      this.prisma.pet.findFirst({ where: { id: dto.petId, tutorId: tutor.id, businessId: null, isActive: true } }),
      this.prisma.service.findFirst({ where: { id: dto.serviceId, businessId: business.id, isActive: true } }),
      this.prisma.user.findFirst({ where: { businessId: business.id, isActive: true }, orderBy: { createdAt: 'asc' } }),
    ]);
    if (!pet) throw new BadRequestException('Pet nao encontrado para este tutor');
    if (!service) throw new BadRequestException('Servico nao encontrado neste negocio');
    if (!professional) throw new BadRequestException('Negocio sem profissional disponivel para receber agendamentos');

    return this.prisma.appointment.create({
      data: {
        businessId: business.id,
        tutorId: tutor.id,
        petId: pet.id,
        serviceId: service.id,
        professionalId: professional.id,
        appointmentType: service.category === 'GROOMING' ? 'GROOMING' : 'CONSULTATION',
        scheduledDate: new Date(dto.scheduledDate),
        scheduledTime: dto.scheduledTime,
        duration: service.duration,
        price: service.price,
        finalPrice: service.price,
        notes: dto.notes,
      },
      include: { tutor: true, pet: true, service: true, professional: { select: { id: true, name: true } } },
    });
  }

  async findAllPublic(query?: { search?: string; businessType?: string }) {
    const where: any = {};
    if (query?.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query?.businessType) {
      where.businessTypes = { has: query.businessType };
    }

    return this.prisma.business.findMany({
      where,
      select: {
        name: true,
        slug: true,
        businessTypes: true,
        phone: true,
        email: true,
        city: true,
        state: true,
        logoUrl: true,
        _count: { select: { services: { where: { isActive: true } } } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.business.update({
      where: { id },
      data,
    });
  }

  async updateSettings(id: string, settings: any) {
    await this.findOne(id);
    return this.prisma.business.update({
      where: { id },
      data: { settings },
    });
  }

  async getDashboardStats(id: string) {
    const [
      tutorsCount,
      petsCount,
      appointmentsToday,
      pendingVaccines,
      activeBoarding,
      monthRevenue,
    ] = await Promise.all([
      this.prisma.tutor.count({ where: { businessId: id } }),
      this.prisma.pet.count({ where: { businessId: id, isActive: true } }),
      this.prisma.appointment.count({
        where: {
          businessId: id,
          scheduledDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.prisma.vaccineRecord.count({
        where: {
          businessId: id,
          nextDoseDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.boarding.count({
        where: {
          businessId: id,
          status: 'CHECKED_IN',
        },
      }),
      this.prisma.sale.aggregate({
        where: {
          businessId: id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      tutorsCount,
      petsCount,
      appointmentsToday,
      pendingVaccines,
      activeBoarding,
      monthRevenue: monthRevenue._sum.totalAmount || 0,
    };
  }
}
