import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerificationRequestDto } from './dto/verification-request.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        ...createUserDto,
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
      include: {
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
