import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WALLET, LEDGER_TYPE } from '../../common/constants/wallet.constants';

// ---------------------------------------------------------------------------
// Mock factory — $transaction runs the callback with the same mock object.
// ---------------------------------------------------------------------------
const mockPrismaService = () => {
  const prisma: any = {
    balanceHistory: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    topUpRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  prisma.$transaction = jest.fn((cb: any) => cb(prisma));
  return prisma;
};

const USER_ID = 'user-wallet-111';
const ADMIN_ID = 'admin-999';
const TOPUP_ID = 'topup-aaa-111';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getBalance', () => {
    it('sums the ledger and rounds to 2 decimals', async () => {
      prisma.balanceHistory.aggregate.mockResolvedValue({ _sum: { amount: 12.345 } });
      const res = await service.getBalance(USER_ID);
      expect(res).toEqual({ balance: 12.35, currency: WALLET.CURRENCY });
    });

    it('returns 0 for a user with no ledger entries', async () => {
      prisma.balanceHistory.aggregate.mockResolvedValue({ _sum: { amount: null } });
      const res = await service.getBalance(USER_ID);
      expect(res.balance).toBe(0);
    });
  });

  describe('requestTopUp', () => {
    it('creates a pending request and returns the platform IBAN to pay to', async () => {
      prisma.topUpRequest.create.mockResolvedValue({
        id: TOPUP_ID,
        amount: 100,
        status: 'pending',
      });

      const res = await service.requestTopUp(USER_ID, { amount: 100 });

      expect(prisma.topUpRequest.create).toHaveBeenCalledWith({
        data: { userId: USER_ID, amount: 100, reference: undefined, status: 'pending' },
      });
      expect(res.status).toBe('pending');
      expect(res.payTo.iban).toBe(WALLET.PLATFORM_IBAN);
      // No credit until an admin confirms.
      expect(prisma.balanceHistory.create).not.toHaveBeenCalled();
    });
  });

  describe('confirmTopUp', () => {
    it('credits the ledger with the top-up amount and marks it confirmed', async () => {
      prisma.topUpRequest.findUnique.mockResolvedValue({
        id: TOPUP_ID,
        userId: USER_ID,
        amount: 100,
        status: 'pending',
      });

      const res = await service.confirmTopUp(ADMIN_ID, TOPUP_ID);

      expect(prisma.topUpRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: TOPUP_ID },
          data: expect.objectContaining({ status: 'confirmed', reviewedById: ADMIN_ID }),
        })
      );
      expect(prisma.balanceHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: USER_ID,
          amount: 100,
          type: LEDGER_TYPE.TOPUP,
        }),
      });
      expect(res).toEqual({ id: TOPUP_ID, status: 'confirmed', amount: 100 });
    });

    it('is idempotent: rejects a top-up that is already confirmed (no double credit)', async () => {
      prisma.topUpRequest.findUnique.mockResolvedValue({
        id: TOPUP_ID,
        userId: USER_ID,
        amount: 100,
        status: 'confirmed',
      });

      await expect(service.confirmTopUp(ADMIN_ID, TOPUP_ID)).rejects.toThrow(BadRequestException);
      expect(prisma.balanceHistory.create).not.toHaveBeenCalled();
    });

    it('throws NotFound when the request does not exist', async () => {
      prisma.topUpRequest.findUnique.mockResolvedValue(null);
      await expect(service.confirmTopUp(ADMIN_ID, TOPUP_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('rejectTopUp', () => {
    it('marks pending as rejected without crediting', async () => {
      prisma.topUpRequest.findUnique.mockResolvedValue({
        id: TOPUP_ID,
        userId: USER_ID,
        amount: 100,
        status: 'pending',
        reference: null,
      });
      prisma.topUpRequest.update.mockResolvedValue({ id: TOPUP_ID, status: 'rejected' });

      await service.rejectTopUp(ADMIN_ID, TOPUP_ID, 'no transfer received');

      expect(prisma.balanceHistory.create).not.toHaveBeenCalled();
      expect(prisma.topUpRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'rejected', reviewedById: ADMIN_ID }),
        })
      );
    });
  });
});
