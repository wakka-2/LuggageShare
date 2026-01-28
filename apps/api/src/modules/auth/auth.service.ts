import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AppleAuthDto } from './dto/apple-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async googleAuth(dto: GoogleAuthDto) {
    try {
      // Verify Google token
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${dto.idToken}`,
      );

      const { email, name, picture, sub: googleId } = response.data;

      // Find or create user
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        user = await this.usersService.create({
          email,
          name,
          avatarUrl: picture,
          googleId,
          provider: 'google',
        });
      }

      // Generate tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async appleAuth(dto: AppleAuthDto) {
    try {
      // For Apple, the idToken needs to be verified against Apple's public keys
      // This is a simplified version - production should verify the JWT properly
      const decoded = this.jwtService.decode(dto.identityToken) as any;

      if (!decoded) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      const { email, sub: appleId } = decoded;
      const name = dto.fullName?.givenName
        ? `${dto.fullName.givenName} ${dto.fullName.familyName || ''}`.trim()
        : 'User';

      // Find or create user
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        user = await this.usersService.create({
          email,
          name,
          appleId,
          provider: 'apple',
        });
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    };
  }
}
