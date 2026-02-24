import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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

  async getHistory(userId: string) {
    return this.prisma.balanceHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
