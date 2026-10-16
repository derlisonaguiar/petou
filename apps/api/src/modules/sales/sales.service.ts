import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, query?: any) {
    const { startDate, endDate, tutorId, page = 1, limit = 20 } = query || {};
    const where: any = { businessId };
    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    if (tutorId) where.tutorId = tutorId;

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: { tutor: true, user: { select: { name: true } }, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
    ]);
    return { data: sales, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, businessId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, businessId },
      include: { tutor: true, user: true, items: { include: { product: true } } },
    });
    if (!sale) throw new NotFoundException('Venda nao encontrada');
    return sale;
  }

  async create(businessId: string, userId: string, data: CreateSaleDto) {
    const quantitiesByProduct = new Map<string, number>();
    for (const item of data.items) {
      quantitiesByProduct.set(item.productId, (quantitiesByProduct.get(item.productId) || 0) + item.quantity);
    }

    return this.prisma.$transaction(async (prisma) => {
      if (data.tutorId) {
        const tutor = await prisma.tutor.findFirst({ where: { id: data.tutorId, businessId } });
        if (!tutor) throw new NotFoundException('Cliente nao encontrado');
      }

      const productIds = [...quantitiesByProduct.keys()];
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, businessId, isActive: true },
      });
      if (products.length !== productIds.length) {
        throw new NotFoundException('Um ou mais produtos nao foram encontrados');
      }

      const productsById = new Map(products.map((product) => [product.id, product]));
      for (const [productId, quantity] of quantitiesByProduct) {
        const product = productsById.get(productId)!;
        if (Number(product.currentStock) < quantity) {
          throw new BadRequestException(`Estoque insuficiente para ${product.name}`);
        }
      }

      const saleItems = data.items.map((item) => {
        const product = productsById.get(item.productId)!;
        const unitPrice = Number(product.salePrice);
        return {
          productId: product.id,
          description: product.name,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
          itemType: 'PRODUCT',
        };
      });
      const subtotal = saleItems.reduce((total, item) => total + item.totalPrice, 0);

      const sale = await prisma.sale.create({
        data: {
          businessId,
          userId,
          tutorId: data.tutorId,
          paymentMethod: data.paymentMethod,
          subtotal,
          totalAmount: subtotal,
          items: { create: saleItems },
        },
        include: { items: true, tutor: true },
      });

      for (const [productId, quantity] of quantitiesByProduct) {
        const product = productsById.get(productId)!;
        const updated = await prisma.product.updateMany({
          where: { id: productId, businessId, currentStock: { gte: quantity } },
          data: { currentStock: { decrement: quantity } },
        });
        if (updated.count !== 1) {
          throw new BadRequestException(`Estoque insuficiente para ${product.name}`);
        }
        await prisma.stockMovement.create({
          data: {
            productId,
            type: 'SALE',
            quantity,
            previousStock: Number(product.currentStock),
            newStock: Number(product.currentStock) - quantity,
            saleId: sale.id,
          },
        });
      }

      if (data.tutorId) {
        await prisma.tutor.update({
          where: { id: data.tutorId },
          data: { totalSpent: { increment: subtotal }, lastVisitAt: new Date() },
        });
      }

      return sale;
    });
  }
}
