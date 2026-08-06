import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletHistoryQueryDto } from './dto/wallet-query.dto';
import { TopUpRequestDto } from './dto/topup-request.dto';
import { WALLET, LEDGER_TYPE } from '../../common/constants/wallet.constants';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: string) {
    const result = await this.prisma.balanceHistory.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const balance = result._sum.amount ? Number(result._sum.amount) : 0;

    return {
      balance: Math.round(balance * 100) / 100,
      currency: WALLET.CURRENCY,
    };
  }

  async getHistory(userId: string, query?: WalletHistoryQueryDto) {
    return this.prisma.balanceHistory.findMany({
      where: {
        userId,
        ...(query?.type && { type: query.type }),
        ...(query?.from || query?.to
          ? {
              createdAt: {
                ...(query?.from && { gte: new Date(query.from) }),
                ...(query?.to && { lte: new Date(query.to) }),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ─── Top-up (bank transfer → admin confirmation → credit) ──────────────────

  /**
   * Record a pending top-up and return the platform payout details the user
   * should transfer to. No credit is added until an admin confirms receipt.
   */
  async requestTopUp(userId: string, dto: TopUpRequestDto) {
    const request = await this.prisma.topUpRequest.create({
      data: {
        userId,
        amount: dto.amount,
        reference: dto.reference,
        status: 'pending',
      },
    });

    return {
      id: request.id,
      amount: Number(request.amount),
      status: request.status,
      currency: WALLET.CURRENCY,
      payTo: {
        iban: WALLET.PLATFORM_IBAN,
        bankName: WALLET.PLATFORM_BANK,
        accountName: WALLET.PLATFORM_ACCOUNT_NAME,
      },
      instructions: `Transfer ${Number(request.amount)} ${WALLET.CURRENCY} to the IBAN above. Your credits are added once we confirm the transfer.`,
    };
  }

  /** A user's own top-up requests (to show status: pending/confirmed/rejected). */
  async getMyTopUps(userId: string) {
    return this.prisma.topUpRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  async getPendingTopUps() {
    return this.prisma.topUpRequest.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /** Confirm receipt and credit the user's ledger. Atomic + idempotent. */
  async confirmTopUp(adminId: string, topUpId: string) {
    return this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const req = await tx.topUpRequest.findUnique({ where: { id: topUpId } });
        if (!req) throw new NotFoundException('Top-up request not found');
        if (req.status !== 'pending') {
          throw new BadRequestException(`Top-up is already ${req.status}`);
        }

        await tx.topUpRequest.update({
          where: { id: topUpId },
          data: { status: 'confirmed', reviewedAt: new Date(), reviewedById: adminId },
        });

        await tx.balanceHistory.create({
          data: {
            userId: req.userId,
            amount: req.amount,
            type: LEDGER_TYPE.TOPUP,
            description: 'Credit top-up (bank transfer confirmed)',
          },
        });

        return { id: req.id, status: 'confirmed', amount: Number(req.amount) };
      },
      { isolationLevel: 'Serializable' as Prisma.TransactionIsolationLevel }
    );
  }

  async rejectTopUp(adminId: string, topUpId: string, reason?: string) {
    const req = await this.prisma.topUpRequest.findUnique({ where: { id: topUpId } });
    if (!req) throw new NotFoundException('Top-up request not found');
    if (req.status !== 'pending') {
      throw new BadRequestException(`Top-up is already ${req.status}`);
    }

    return this.prisma.topUpRequest.update({
      where: { id: topUpId },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedById: adminId,
        reference: reason ? `${req.reference ?? ''} | rejected: ${reason}`.trim() : req.reference,
      },
    });
  }
}
