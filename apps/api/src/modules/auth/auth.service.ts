import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AppleAuthDto } from './dto/apple-auth.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

// Cache Apple's public keys (refresh every 24 hours)
let appleKeysCache: { keys: any[]; fetchedAt: number } | null = null;
const APPLE_KEYS_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      provider: 'email',
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokens(user);
  }

  async googleAuth(dto: GoogleAuthDto) {
    try {
      // Verify the access token and fetch the user's profile in one call.
      // useGoogleLogin (implicit flow) returns an opaque access_token — we verify
      // it via Google's userinfo endpoint (tokeninfo?id_token= only works for JWT ID tokens).
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${dto.accessToken}` },
      });

      const { email, name, picture, sub: googleId } = response.data;

      if (!email) {
        throw new UnauthorizedException('Google account has no email');
      }

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
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async appleAuth(dto: AppleAuthDto) {
    try {
      // Verify Apple identity token against Apple's public keys
      const decoded = await this.verifyAppleToken(dto.identityToken);

      if (!decoded || !decoded.email) {
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
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: refreshSecret,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Look up the stored token by hash
      const tokenHash = this.hashToken(dto.refreshToken);
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Token not found');
      }

      // Reuse detection: if already revoked, the family was compromised
      if (storedToken.isRevoked) {
        await this.prisma.refreshToken.updateMany({
          where: { family: storedToken.family },
          data: { isRevoked: true },
        });
        throw new UnauthorizedException('Token reuse detected');
      }

      if (storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Token expired');
      }

      // Revoke the current token (single-use)
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Issue new tokens in the same family
      return this.generateTokens(user, storedToken.family);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async devLogin(userIndex = 0) {
    const devUsers = [
      { email: 'dev@luggageshare.com', name: 'Dev User' },
      { email: 'dev2@luggageshare.com', name: 'Dev User 2' },
    ];
    const { email, name } = devUsers[userIndex] || devUsers[0];
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        email,
        name,
        provider: 'dev',
      });
    }

    return this.generateTokens(user);
  }

  private async generateTokens(
    user: {
      id: string;
      email: string;
      name: string;
      avatarUrl: string | null;
      isVerified: boolean;
    },
    family?: string
  ) {
    const tokenFamily = family || crypto.randomUUID();
    const accessPayload = { sub: user.id, email: user.email, type: 'access' };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
    });

    const refreshPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
      family: tokenFamily,
    };
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    // Store hashed refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        family: tokenFamily,
        expiresAt,
      },
    });

    // Cleanup expired tokens for this user (fire-and-forget)
    this.prisma.refreshToken
      .deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } })
      .catch(() => {});

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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verify Apple identity token using Apple's public JWKS keys.
   * Validates: signature, issuer (https://appleid.apple.com), and audience.
   */
  private async verifyAppleToken(identityToken: string): Promise<any> {
    // Decode header to get the key ID (kid)
    const header = JSON.parse(Buffer.from(identityToken.split('.')[0], 'base64url').toString());

    if (!header.kid) {
      throw new UnauthorizedException('Apple token missing kid');
    }

    // Fetch Apple's public keys (with cache)
    const appleKeys = await this.getApplePublicKeys();
    const matchingKey = appleKeys.find((k: any) => k.kid === header.kid);

    if (!matchingKey) {
      throw new UnauthorizedException('Apple token key not found');
    }

    // Convert JWK to PEM format for verification
    const publicKey = this.jwkToPem(matchingKey);

    // Verify the token with Apple's public key
    const expectedAudience = this.configService.get<string>('APPLE_CLIENT_ID');

    return new Promise((resolve, reject) => {
      jwt.verify(
        identityToken,
        publicKey,
        {
          algorithms: ['RS256'],
          issuer: 'https://appleid.apple.com',
          ...(expectedAudience && { audience: expectedAudience }),
        },
        (err, decoded) => {
          if (err) reject(new UnauthorizedException('Apple token verification failed'));
          else resolve(decoded);
        }
      );
    });
  }

  private async getApplePublicKeys(): Promise<any[]> {
    if (appleKeysCache && Date.now() - appleKeysCache.fetchedAt < APPLE_KEYS_TTL_MS) {
      return appleKeysCache.keys;
    }

    const response = await axios.get('https://appleid.apple.com/auth/keys');
    appleKeysCache = { keys: response.data.keys, fetchedAt: Date.now() };
    return appleKeysCache.keys;
  }

  /**
   * Convert RSA JWK (from Apple's JWKS) to PEM format.
   */
  private jwkToPem(jwk: { n: string; e: string; kty: string }): string {
    if (jwk.kty !== 'RSA') {
      throw new UnauthorizedException('Unsupported key type');
    }

    const keyObject = crypto.createPublicKey({
      key: {
        kty: jwk.kty,
        n: jwk.n,
        e: jwk.e,
      },
      format: 'jwk',
    });

    return keyObject.export({ type: 'spki', format: 'pem' }) as string;
  }
}
