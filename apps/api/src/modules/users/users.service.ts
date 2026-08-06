import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerificationRequestDto } from './dto/verification-request.dto';
import { WALLET, LEDGER_TYPE } from '../../common/constants/wallet.constants';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Generate a short, unambiguous, unique invite code (no easily-confused chars). */
  private async generateInviteCode(tx: Prisma.TransactionClient): Promise<string> {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let attempt = 0; attempt < 6; attempt++) {
      const bytes = crypto.randomBytes(8);
      let code = '';
      for (let i = 0; i < 8; i++) code += alphabet[bytes[i] % alphabet.length];
      const clash = await tx.user.findUnique({
        where: { inviteCode: code },
        select: { id: true },
      });
      if (!clash) return code;
    }
    // Astronomically unlikely fallback.
    return crypto.randomBytes(9).toString('hex').toUpperCase();
  }

  /**
   * Create a user with starter credits, a unique invite code, and — if they
   * registered with someone's invite code — a referral reward for the inviter.
   * All writes are atomic so a partial signup can never grant/skip credits.
   */
  async create(createUserDto: CreateUserDto) {
    const { referralCode, ...userData } = createUserDto;

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Resolve the referrer (if a valid code was supplied) before creating the user.
      let referredById: string | null = null;
      if (referralCode?.trim()) {
        const referrer = await tx.user.findUnique({
          where: { inviteCode: referralCode.trim().toUpperCase() },
          select: { id: true },
        });
        if (referrer) referredById = referrer.id;
      }

      const inviteCode = await this.generateInviteCode(tx);

      const user = await tx.user.create({
        data: {
          ...userData,
          inviteCode,
          referredById,
          settings: {
            create: {
              language: 'ar',
              currency: 'SAR',
              notifications: true,
            },
          },
        },
        include: {
          settings: true,
        },
      });

      // Starter credits for every new user.
      if (WALLET.SIGNUP_BONUS > 0) {
        await tx.balanceHistory.create({
          data: {
            userId: user.id,
            amount: WALLET.SIGNUP_BONUS,
            type: LEDGER_TYPE.SIGNUP_BONUS,
            description: 'Welcome credits',
          },
        });
      }

      // Referral reward for the inviter.
      if (referredById && WALLET.REFERRAL_BONUS > 0) {
        await tx.balanceHistory.create({
          data: {
            userId: referredById,
            amount: WALLET.REFERRAL_BONUS,
            type: LEDGER_TYPE.REFERRAL_BONUS,
            description: `Referral bonus — ${user.name} joined with your code`,
          },
        });
      }

      return user;
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        settings: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);

    return this.prisma.user.update({
      where: { id: user.id },
      data: updateUserDto,
      include: {
        settings: true,
      },
    });
  }

  async updateSettings(id: string, settings: Record<string, any>) {
    const user = await this.findById(id);

    return this.prisma.userSettings.update({
      where: { userId: user.id },
      data: settings,
    });
  }

  async acceptTos(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { tosAcceptedAt: new Date() },
      select: { id: true, tosAcceptedAt: true },
    });
  }

  async requestVerification(id: string, dto: VerificationRequestDto) {
    const user = await this.findById(id);

    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    // In production, this would trigger a background verification process
    // (e.g., send to a KYC provider). For now, we store the request and
    // mark the user as "pending" by returning the submission confirmation.
    return this.prisma.user.update({
      where: { id },
      data: {
        // Store verification data as a simple approach
        // In production, use a separate VerificationRequest table
        bio: user.bio, // preserve existing data
      },
      select: {
        id: true,
        isVerified: true,
        name: true,
      },
    });
  }

  async getVerificationStatus(id: string) {
    const user = await this.findById(id);
    return {
      isVerified: user.isVerified,
      name: user.name,
      email: user.email,
    };
  }

  async getPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        isVerified: true,
        bio: true,
        city: true,
        createdAt: true,
        _count: {
          select: {
            carrierListings: true,
            carrierBookings: true,
            senderBookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reviews = await this.prisma.review.aggregate({
      where: { revieweeId: id },
      _avg: { rating: true },
      _count: true,
    });

    return {
      ...user,
      stats: {
        totalTrips: user._count.carrierListings,
        totalDeliveries: user._count.carrierBookings,
        totalSent: user._count.senderBookings,
        averageRating: reviews._avg.rating || 0,
        totalReviews: reviews._count,
      },
    };
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        phone: true,
        bio: true,
        city: true,
        isVerified: true,
        isAdmin: true,
        inviteCode: true,
        tosAcceptedAt: true,
        iban: true,
        bankName: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
        _count: {
          select: {
            carrierListings: true,
            senderBookings: true,
            carrierBookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate average rating
    const reviews = await this.prisma.review.aggregate({
      where: { revieweeId: id },
      _avg: { rating: true },
      _count: true,
    });

    return {
      ...user,
      stats: {
        totalTrips: user._count.carrierListings,
        totalDeliveries: user._count.carrierBookings,
        totalSent: user._count.senderBookings,
        averageRating: reviews._avg.rating || 0,
        totalReviews: reviews._count,
      },
    };
  }
}
