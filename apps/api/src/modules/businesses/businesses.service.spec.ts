import { BusinessesService } from './businesses.service';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  unlink: jest.fn(),
  writeFile: jest.fn(),
}));

describe('BusinessesService', () => {
  const prisma = {
    business: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    businessReview: { aggregate: jest.fn() },
  } as any;
  const service = new BusinessesService(prisma);

  beforeEach(() => {
    prisma.business.findMany.mockReset();
    prisma.business.findUnique.mockReset();
    prisma.business.findFirst.mockReset();
    prisma.business.update.mockReset();
    prisma.businessReview.aggregate.mockReset();
    prisma.business.findMany.mockResolvedValue([]);
    prisma.businessReview.aggregate.mockResolvedValue({ _avg: { rating: 0 }, _count: 0 });
  });

  it('filters public businesses for hotels and daycares in the hospitality category', async () => {
    await service.findAllPublic({ businessType: 'HOSPITALITY' });

    expect(prisma.business.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ businessTypes: { hasSome: ['HOTEL', 'DAYCARE'] } }),
    }));
  });

  it('returns the lowest active positive service price without exposing service details', async () => {
    prisma.business.findMany.mockResolvedValue([{ name: 'Pet House', services: [{ price: 80 }, { price: 45 }], _count: { services: 2 } }]);
    await expect(service.findAllPublic()).resolves.toEqual([{ name: 'Pet House', _count: { services: 2 }, lowestServicePrice: 45 }]);
  });

  it('includes gallery URLs in the public business profile response', async () => {
    prisma.business.findFirst.mockResolvedValue({ name: 'Hotel Pet', galleryImages: ['/media/photo.jpg'] });

    await service.findPublicBySlug('hotel-pet');

    expect(prisma.business.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { slug: 'hotel-pet', registrationStatus: 'APPROVED' },
      select: expect.objectContaining({ galleryImages: true }),
    }));
  });

  it('registers accepted gallery images only for the current business', async () => {
    prisma.business.findUnique.mockResolvedValue({ galleryImages: [] });
    prisma.business.update.mockResolvedValue({ galleryImages: ['/media/photo.jpg'] });

    await service.addGalleryImages('business-a', [{
      buffer: Buffer.from('image'),
      mimetype: 'image/jpeg',
      originalname: 'ambiente.jpg',
      size: 5,
    }]);

    expect(prisma.business.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'business-a' },
    }));
  });

  it('does not remove a gallery image that does not belong to the current business', async () => {
    prisma.business.findUnique.mockResolvedValue({ galleryImages: ['/media/11111111-1111-1111-1111-111111111111.jpg'] });

    await expect(service.removeGalleryImage('business-a', '22222222-2222-2222-2222-222222222222.jpg'))
      .rejects.toThrow('Foto não encontrada para este negócio.');

    expect(prisma.business.update).not.toHaveBeenCalled();
  });
});
