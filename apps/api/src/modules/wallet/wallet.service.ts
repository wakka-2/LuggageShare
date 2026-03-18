import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletHistoryQueryDto } from './dto/wallet-query.dto';
import { WithdrawalRequestDto } from './dto/withdrawal-request.dto';

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
      currency: 'SAR',
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

  async requestWithdrawal(userId: string, dto: WithdrawalRequestDto) {
    return this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Atomic balance check inside transaction
        const result = await tx.balanceHistory.aggregate({
          where: { userId },
          _sum: { amount: true },
        });

        const balance = result._sum.amount ? Number(result._sum.amount) : 0;

        if (balance < dto.amount) {
          throw new BadRequestException('Insufficient balance');
        }

        const maskedIban = `${dto.iban.slice(0, 4)}****${dto.iban.slice(-4)}`;

        // Create negative balance entry within the same transaction
        const withdrawal = await tx.balanceHistory.create({
          data: {
            userId,
            amount: -dto.amount,
            type: 'withdrawal',
            description: `Withdrawal to IBAN ${maskedIban}`,
          },
        });

        return {
          id: withdrawal.id,
          amount: dto.amount,
          iban: maskedIban,
          status: 'pending',
          message:
            'Withdrawal request submitted. Funds will be transferred within 2-3 business days.',
        };
      },
      {
        isolationLevel: 'Serializable' as Prisma.TransactionIsolationLevel,
      }
    );
  }
}
