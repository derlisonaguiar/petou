import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicAppointmentDto } from './dto/create-public-appointment.dto';

@Injectable()
export class BusinessesService {
  private static readonly MAX_GALLERY_IMAGES = 6;
  private static readonly MAX_GALLERY_FILE_SIZE = 5 * 1024 * 1024;
  private static readonly GALLERY_MIME_TYPES: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  private static readonly GALLERY_DIRECTORY = join(process.cwd(), 'uploads', 'business-gallery');

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
    const business = await this.prisma.business.findFirst({
      where: { slug, registrationStatus: 'APPROVED' },
      select: {
        id: true,
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
        galleryImages: true,
        registrationStatus: true,
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
        reviews: {
          select: { id: true, rating: true, comment: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!business) throw new NotFoundException('Negocio nao encontrado');
    const reviewStats = await this.prisma.businessReview.aggregate({ where: { businessId: business.id }, _avg: { rating: true }, _count: true });
    return { ...business, reviewSummary: { averageRating: Number(reviewStats._avg.rating || 0), totalReviews: reviewStats._count } };
  }

  async createPublicAppointment(slug: string, userId: string, dto: CreatePublicAppointmentDto) {
    const business = await this.prisma.business.findFirst({ where: { slug, registrationStatus: 'APPROVED' }, select: { id: true } });
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
    const where: any = { registrationStatus: 'APPROVED' };
    if (query?.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query?.businessType === 'HOSPITALITY') {
      where.businessTypes = { hasSome: ['HOTEL', 'DAYCARE'] };
    } else if (query?.businessType) {
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
        services: { where: { isActive: true, price: { gt: 0 } }, select: { price: true } },
      },
      orderBy: { name: 'asc' },
    }).then((businesses) => businesses.map(({ services, ...business }) => ({
      ...business,
      lowestServicePrice: services.length ? Math.min(...services.map((service) => Number(service.price))) : null,
    })));
  }

  async addGalleryImages(businessId: string, photos: Array<{ buffer: Buffer; mimetype: string; originalname: string; size: number }>) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId }, select: { galleryImages: true } });
    if (!business) throw new NotFoundException('Negócio não encontrado');
    if (business.galleryImages.length + photos.length > BusinessesService.MAX_GALLERY_IMAGES) {
      throw new BadRequestException(`A galeria permite no máximo ${BusinessesService.MAX_GALLERY_IMAGES} fotos.`);
    }

    for (const photo of photos) {
      const extension = extname(photo.originalname).toLowerCase();
      if (BusinessesService.GALLERY_MIME_TYPES[photo.mimetype] !== extension) {
        throw new BadRequestException('Envie apenas imagens JPG, PNG ou WEBP.');
      }
      if (!photo.buffer?.length || photo.size > BusinessesService.MAX_GALLERY_FILE_SIZE) {
        throw new BadRequestException('Cada imagem deve ter no máximo 5 MB.');
      }
    }

    await mkdir(BusinessesService.GALLERY_DIRECTORY, { recursive: true });
    const imageUrls = await Promise.all(photos.map(async (photo) => {
      const fileName = `${randomUUID()}${BusinessesService.GALLERY_MIME_TYPES[photo.mimetype]}`;
      await writeFile(join(BusinessesService.GALLERY_DIRECTORY, fileName), photo.buffer);
      return `/media/${fileName}`;
    }));

    return this.prisma.business.update({
      where: { id: businessId },
      data: { galleryImages: [...business.galleryImages, ...imageUrls] },
      select: { galleryImages: true },
    });
  }

  async removeGalleryImage(businessId: string, fileName: string) {
    if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(fileName)) throw new BadRequestException('Foto inválida.');
    const imageUrl = `/media/${fileName}`;
    const business = await this.prisma.business.findUnique({ where: { id: businessId }, select: { galleryImages: true } });
    if (!business || !business.galleryImages.includes(imageUrl)) throw new NotFoundException('Foto não encontrada para este negócio.');

    const galleryImages = business.galleryImages.filter((url) => url !== imageUrl);
    await this.prisma.business.update({ where: { id: businessId }, data: { galleryImages }, select: { galleryImages: true } });
    await unlink(join(BusinessesService.GALLERY_DIRECTORY, fileName)).catch(() => undefined);
    return { galleryImages };
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
