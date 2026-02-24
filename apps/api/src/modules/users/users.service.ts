import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
