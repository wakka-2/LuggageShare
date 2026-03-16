import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PrismaService } from '../../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Mock factory
// ---------------------------------------------------------------------------
const mockPrismaService = () => {
  const prisma = {
    balanceHistory: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  // $transaction executes the callback with the same mock so that
  // tx.balanceHistory.aggregate / tx.balanceHistory.create resolve
  // to whatever was configured on mockPrisma.
  prisma.$transaction = jest.fn((cb) => cb(prisma));

  return prisma;
};

// ---------------------------------------------------------------------------
// Reusable test fixtures
// ---------------------------------------------------------------------------
const USER_ID = 'user-wallet-111';
const OTHER_USER_ID = 'user-wallet-222';
const ENTRY_ID = 'entry-aaa-111';

const makeHistoryEntry = (overrides: Record<string, unknown> = {}) => ({
  id: ENTRY_ID,
  userId: USER_ID,
  amount: 100,
  type: 'credit',
  description: 'Booking payment received',
  createdAt: new Date('2026-02-01T10:00:00Z'),
  updatedAt: new Date('2026-02-01T10:00:00Z'),
  ...overrides,
});

const makeWithdrawalDto = (overrides: Record<string, unknown> = {}) => ({
  amount: 50,
  iban: 'SA0380000000608010167519',
  bankAccountName: 'John Doe',
  ...overrides,
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('WalletService', () => {
  let service: WalletService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService, { provide: PrismaService, useFactory: mockPrismaService }],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // getBalance
  // =========================================================================
  describe('getBalance', () => {
    it('should return the aggregated balance and currency SAR', async () => {
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 250.75 },
      });

      const result = await service.getBalance(USER_ID);

      expect(result).toEqual({ balance: 250.75, currency: 'SAR' });
      expect(prisma.balanceHistory.aggregate).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        _sum: { amount: true },
      });
    });

    it('should return 0 balance when user has no history entries', async () => {
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });

      const result = await service.getBalance(USER_ID);

      expect(result).toEqual({ balance: 0, currency: 'SAR' });
    });

    it('should round balance to two decimal places', async () => {
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 100.456 },
      });

      const result = await service.getBalance(USER_ID);

      expect(result.balance).toBe(100.46);
    });

    it('should handle negative aggregate (more withdrawals than credits)', async () => {
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: -25.5 },
      });

      const result = await service.getBalance(USER_ID);

      expect(result.balance).toBe(-25.5);
      expect(result.currency).toBe('SAR');
    });

    it('should always return currency as SAR', async () => {
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 0 },
      });

      const result = await service.getBalance(USER_ID);

      expect(result.currency).toBe('SAR');
    });
  });

  // =========================================================================
  // getHistory
  // =========================================================================
  describe('getHistory', () => {
    it('should return all history entries for the user ordered by createdAt desc', async () => {
      const entries = [
        makeHistoryEntry({ id: 'entry-2', createdAt: new Date('2026-02-15') }),
        makeHistoryEntry({ id: 'entry-1', createdAt: new Date('2026-02-01') }),
      ];
      prisma.balanceHistory.findMany.mockResolvedValue(entries);

      const result = await service.getHistory(USER_ID);

      expect(result).toEqual(entries);
      expect(prisma.balanceHistory.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('should return empty array when user has no history', async () => {
      prisma.balanceHistory.findMany.mockResolvedValue([]);

      const result = await service.getHistory(OTHER_USER_ID);

      expect(result).toEqual([]);
    });

    it('should filter by type when provided in query', async () => {
      prisma.balanceHistory.findMany.mockResolvedValue([]);

      await service.getHistory(USER_ID, { type: 'credit' });

      expect(prisma.balanceHistory.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID, type: 'credit' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('should filter by from date when provided', async () => {
      prisma.balanceHistory.findMany.mockResolvedValue([]);
      const fromDate = '2026-01-01';

      await service.getHistory(USER_ID, { from: fromDate });

      const call = prisma.balanceHistory.findMany.mock.calls[0][0];
      expect(call.where.createdAt).toEqual({
        gte: new Date(fromDate),
      });
    });

    it('should filter by to date when provided', async () => {
      prisma.balanceHistory.findMany.mockResolvedValue([]);
      const toDate = '2026-12-31';

      await service.getHistory(USER_ID, { to: toDate });

      const call = prisma.balanceHistory.findMany.mock.calls[0][0];
      expect(call.where.createdAt).toEqual({
        lte: new Date(toDate),
      });
    });

    it('should filter by both from and to dates when provided', async () => {
      prisma.balanceHistory.findMany.mockResolvedValue([]);
      const fromDate = '2026-01-01';
      const toDate = '2026-06-30';

      await service.getHistory(USER_ID, { from: fromDate, to: toDate });

      const call = prisma.balanceHistory.findMany.mock.calls[0][0];
      expect(call.where.createdAt).toEqual({
        gte: new Date(fromDate),
        lte: new Date(toDate),
      });
    });

    it('should combine type and date filters together', async () => {
      prisma.balanceHistory.findMany.mockResolvedValue([]);

      await service.getHistory(USER_ID, {
        type: 'debit',
        from: '2026-03-01',
        to: '2026-03-31',
      });

      const call = prisma.balanceHistory.findMany.mock.calls[0][0];
      expect(call.where.userId).toBe(USER_ID);
      expect(call.where.type).toBe('debit');
      expect(call.where.createdAt).toEqual({
        gte: new Date('2026-03-01'),
        lte: new Date('2026-03-31'),
      });
    });

    it('should not include type filter when type is not provided', async () => {
      prisma.balanceHistory.findMany.mockResolvedValue([]);

      await service.getHistory(USER_ID, {});

      const call = prisma.balanceHistory.findMany.mock.calls[0][0];
      expect(call.where.type).toBeUndefined();
    });

    it('should not include createdAt filter when neither from nor to is provided', async () => {
      prisma.balanceHistory.findMany.mockResolvedValue([]);

      await service.getHistory(USER_ID, {});

      const call = prisma.balanceHistory.findMany.mock.calls[0][0];
      expect(call.where.createdAt).toBeUndefined();
    });

    it('should limit results to 50 entries', async () => {
      prisma.balanceHistory.findMany.mockResolvedValue([]);

      await service.getHistory(USER_ID);

      const call = prisma.balanceHistory.findMany.mock.calls[0][0];
      expect(call.take).toBe(50);
    });
  });

  // =========================================================================
  // requestWithdrawal
  // =========================================================================
  describe('requestWithdrawal', () => {
    it('should successfully create withdrawal when balance is sufficient', async () => {
      const dto = makeWithdrawalDto();
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 200 },
      });
      prisma.balanceHistory.create.mockResolvedValue({
        id: 'withdrawal-001',
        userId: USER_ID,
        amount: -50,
        type: 'withdrawal',
        description: 'Withdrawal to IBAN SA03****7519',
        createdAt: new Date(),
      });

      const result = await service.requestWithdrawal(USER_ID, dto as any);

      expect(result.id).toBe('withdrawal-001');
      expect(result.amount).toBe(50);
      expect(result.status).toBe('pending');
      expect(result.message).toContain('2-3 business days');
    });

    it('should use prisma.$transaction with Serializable isolation level', async () => {
      const dto = makeWithdrawalDto();
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 200 },
      });
      prisma.balanceHistory.create.mockResolvedValue({
        id: 'withdrawal-001',
        userId: USER_ID,
        amount: -50,
        type: 'withdrawal',
        description: 'Withdrawal to IBAN SA03****7519',
      });

      await service.requestWithdrawal(USER_ID, dto as any);

      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
        isolationLevel: 'Serializable',
      });
    });

    it('should throw BadRequestException when balance is insufficient', async () => {
      const dto = makeWithdrawalDto({ amount: 500 });
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 100 },
      });

      await expect(service.requestWithdrawal(USER_ID, dto as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw with "Insufficient balance" message', async () => {
      const dto = makeWithdrawalDto({ amount: 500 });
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 100 },
      });

      await expect(service.requestWithdrawal(USER_ID, dto as any)).rejects.toThrow(
        'Insufficient balance'
      );
    });

    it('should throw when balance is zero', async () => {
      const dto = makeWithdrawalDto({ amount: 10 });
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });

      await expect(service.requestWithdrawal(USER_ID, dto as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should create a negative amount entry for the withdrawal', async () => {
      const dto = makeWithdrawalDto({ amount: 75 });
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 200 },
      });
      prisma.balanceHistory.create.mockResolvedValue({
        id: 'withdrawal-002',
        userId: USER_ID,
        amount: -75,
        type: 'withdrawal',
        description: 'Withdrawal to IBAN SA03****7519',
      });

      await service.requestWithdrawal(USER_ID, dto as any);

      expect(prisma.balanceHistory.create).toHaveBeenCalledWith({
        data: {
          userId: USER_ID,
          amount: -75,
          type: 'withdrawal',
          description: expect.stringContaining('Withdrawal to IBAN'),
        },
      });
    });

    it('should mask the IBAN keeping only first 4 and last 4 characters', async () => {
      const iban = 'SA0380000000608010167519';
      const dto = makeWithdrawalDto({ iban });
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 200 },
      });
      prisma.balanceHistory.create.mockResolvedValue({
        id: 'withdrawal-003',
        userId: USER_ID,
        amount: -50,
        type: 'withdrawal',
        description: 'Withdrawal to IBAN SA03****7519',
      });

      const result = await service.requestWithdrawal(USER_ID, dto as any);

      // Masked IBAN: first 4 = "SA03", last 4 = "7519"
      expect(result.iban).toBe('SA03****7519');
    });

    it('should include masked IBAN in the balance history description', async () => {
      const iban = 'SA0380000000608010167519';
      const dto = makeWithdrawalDto({ iban });
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 200 },
      });
      prisma.balanceHistory.create.mockResolvedValue({
        id: 'withdrawal-004',
        userId: USER_ID,
        amount: -50,
        type: 'withdrawal',
        description: 'Withdrawal to IBAN SA03****7519',
      });

      await service.requestWithdrawal(USER_ID, dto as any);

      expect(prisma.balanceHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: 'Withdrawal to IBAN SA03****7519',
        }),
      });
    });

    it('should not create balance entry when balance check fails', async () => {
      const dto = makeWithdrawalDto({ amount: 9999 });
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 50 },
      });

      await expect(service.requestWithdrawal(USER_ID, dto as any)).rejects.toThrow();

      // The create inside the transaction callback should not have been
      // reached because the balance check throws first.
      expect(prisma.balanceHistory.create).not.toHaveBeenCalled();
    });

    it('should allow withdrawal when amount equals exact balance', async () => {
      const dto = makeWithdrawalDto({ amount: 100 });
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 100 },
      });
      prisma.balanceHistory.create.mockResolvedValue({
        id: 'withdrawal-exact',
        userId: USER_ID,
        amount: -100,
        type: 'withdrawal',
        description: 'Withdrawal to IBAN SA03****7519',
      });

      const result = await service.requestWithdrawal(USER_ID, dto as any);

      expect(result.id).toBe('withdrawal-exact');
      expect(result.amount).toBe(100);
      expect(prisma.balanceHistory.create).toHaveBeenCalled();
    });

    it('should return pending status in the response', async () => {
      const dto = makeWithdrawalDto();
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 200 },
      });
      prisma.balanceHistory.create.mockResolvedValue({
        id: 'withdrawal-005',
        userId: USER_ID,
        amount: -50,
        type: 'withdrawal',
        description: 'Withdrawal to IBAN SA03****7519',
      });

      const result = await service.requestWithdrawal(USER_ID, dto as any);

      expect(result.status).toBe('pending');
    });

    it('should return a user-friendly message about transfer timeline', async () => {
      const dto = makeWithdrawalDto();
      prisma.balanceHistory.aggregate.mockResolvedValue({
        _sum: { amount: 200 },
      });
      prisma.balanceHistory.create.mockResolvedValue({
        id: 'withdrawal-006',
        userId: USER_ID,
        amount: -50,
        type: 'withdrawal',
        description: 'Withdrawal to IBAN SA03****7519',
      });

      const result = await service.requestWithdrawal(USER_ID, dto as any);

      expect(result.message).toBe(
        'Withdrawal request submitted. Funds will be transferred within 2-3 business days.'
      );
    });
  });
});
