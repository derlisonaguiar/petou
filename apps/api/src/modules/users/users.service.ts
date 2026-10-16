import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { RegisterTutorDto } from '../auth/dto/register-tutor.dto';
import { RegisterProfessionalDto } from '../auth/dto/register-professional.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { business: true },
    });
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
      include: { business: true },
    });
  }

  async findByBusinessId(businessId: string) {
    return this.prisma.user.findMany({
      where: { businessId },
      orderBy: { name: 'asc' },
    });
  }

  async findOneInBusiness(id: string, businessId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, businessId },
      include: { business: true },
    });
    if (!user) throw new NotFoundException('Usuario nao encontrado');
    return user;
  }

  async createWithBusiness(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.findByEmail(dto.userEmail);
    if (existingUser) {
      throw new ConflictException('Email ja cadastrado');
    }

    // Create slug from business name
    const slug = dto.businessName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingBusiness = await this.prisma.business.findUnique({
      where: { slug },
    });

    const finalSlug = existingBusiness
      ? `${slug}-${Date.now().toString(36)}`
      : slug;

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create business and user in transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      const business = await prisma.business.create({
        data: {
          name: dto.businessName,
          slug: finalSlug,
          cnpj: dto.cnpj,
          phone: dto.businessPhone,
          email: dto.businessEmail,
          businessTypes: dto.businessTypes,
        },
      });

      const user = await prisma.user.create({
        data: {
          businessId: business.id,
          name: dto.userName,
          email: dto.userEmail,
          phone: dto.userPhone,
          accountType: 'BUSINESS',
          role: 'OWNER',
          passwordHash,
        },
      });

      return { business, user };
    });

    const { passwordHash: _, ...userWithoutPassword } = result.user;
    return {
      business: result.business,
      user: userWithoutPassword,
    };
  }

  async createTutorAccount(dto: RegisterTutorDto) {
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email ja cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          accountType: 'TUTOR',
          businessId: null,
        },
      });

      const tutor = await prisma.tutor.create({
        data: {
          userId: user.id,
          businessId: null,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
        },
      });

      return { user, tutor };
    });

    const { passwordHash: _, ...userWithoutPassword } = result.user;
    return {
      user: userWithoutPassword,
      tutor: result.tutor,
    };
  }

  async createProfessionalAccount(dto: RegisterProfessionalDto) {
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email ja cadastrado');
    }

    const existingPetSitter = await this.prisma.petSitter.findUnique({
      where: { email: dto.email },
    });
    if (existingPetSitter) {
      throw new ConflictException('Email ja cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          accountType: 'PROFESSIONAL',
          businessId: null,
        },
      });

      const petSitter = await prisma.petSitter.create({
        data: {
          userId: user.id,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          bio: dto.bio,
          photos: [],
          acceptedSpecies: [],
          acceptedSizes: [],
          certifications: [],
          documentsUrl: [],
        },
      });

      return { user, petSitter };
    });

    const { passwordHash: _, ...userWithoutPassword } = result.user;
    return {
      user: userWithoutPassword,
      petSitter: result.petSitter,
    };
  }

  async update(id: string, data: any) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateInBusiness(id: string, businessId: string, data: any) {
    await this.findOneInBusiness(id, businessId);
    const { businessId: _businessId, accountType: _accountType, ...safeData } = data;
    return this.update(id, safeData);
  }

  async delete(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    return this.prisma.user.delete({ where: { id } });
  }

  async deleteInBusiness(id: string, businessId: string) {
    await this.findOneInBusiness(id, businessId);
    return this.delete(id);
  }
}
