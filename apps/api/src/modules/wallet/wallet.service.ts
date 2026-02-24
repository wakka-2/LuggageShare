import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletHistoryQueryDto } from './dto/wallet-query.dto';
import { WithdrawalRequestDto } from './dto/withdrawal-request.dto';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: string) {
    const history = await this.prisma.balanceHistory.findMany({
      where: { userId },
    });

    const balance = history.reduce((sum, entry) => {
      return sum + Number(entry.amount);
    }, 0);

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
    const { balance } = await this.getBalance(userId);

    if (balance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create a negative balance entry representing the withdrawal
    const withdrawal = await this.prisma.balanceHistory.create({
      data: {
        userId,
        amount: -dto.amount,
        type: 'withdrawal',
        description: `Withdrawal to IBAN ${dto.iban.slice(0, 4)}****${dto.iban.slice(-4)}`,
      },
    });

    return {
      id: withdrawal.id,
      amount: dto.amount,
      iban: `${dto.iban.slice(0, 4)}****${dto.iban.slice(-4)}`,
      status: 'pending',
      message: 'Withdrawal request submitted. Funds will be transferred within 2-3 business days.',
    };
  }
}
