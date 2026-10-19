import { UsersService } from './users.service';

describe('UsersService registration approval', () => {
  const transaction = {
    business: { create: jest.fn() },
    user: { create: jest.fn() },
    petSitter: { create: jest.fn() },
  };
  const prisma = {
    user: { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn() },
    business: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    petSitter: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(async (callback) => callback(transaction)),
  } as any;
  const service = new UsersService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.business.findUnique.mockResolvedValue(null);
    transaction.business.create.mockResolvedValue({ id: 'business-new', registrationStatus: 'PENDING' });
    transaction.user.create.mockResolvedValue({ id: 'user-new', passwordHash: 'hash' });
  });

  it('creates a new business registration as pending', async () => {
    await service.createWithBusiness({
      businessName: 'Hotel do Pet', businessPhone: '11999999999', businessTypes: ['HOTEL'],
      userName: 'Ana', userEmail: 'ana@example.com', userPhone: '11988888888', password: 'secret1',
    });

    expect(transaction.business.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ registrationStatus: 'PENDING' }),
    }));
  });

  it('creates a new professional registration as pending', async () => {
    prisma.petSitter.findUnique.mockResolvedValue(null);
    transaction.petSitter.create.mockResolvedValue({ id: 'professional-new', registrationStatus: 'PENDING' });

    await service.createProfessionalAccount({ name: 'João', email: 'joao@example.com', phone: '11988888888', password: 'secret1' });

    expect(transaction.petSitter.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ registrationStatus: 'PENDING' }),
    }));
  });

  it('approves or rejects only the registration identified by the administrator', async () => {
    await service.reviewBusinessRegistration('business-a', 'APPROVED');
    await service.reviewProfessionalRegistration('professional-b', 'REJECTED');

    expect(prisma.business.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'business-a' }, data: { registrationStatus: 'APPROVED' } }));
    expect(prisma.petSitter.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'professional-b' }, data: { registrationStatus: 'REJECTED' } }));
  });
});
