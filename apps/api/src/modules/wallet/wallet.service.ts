import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletHistoryQueryDto } from './dto/wallet-query.dto';

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
}
