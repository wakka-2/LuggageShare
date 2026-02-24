import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AppleAuthDto } from './dto/apple-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

// Cache Apple's public keys (refresh every 24 hours)
let appleKeysCache: { keys: any[]; fetchedAt: number } | null = null;
const APPLE_KEYS_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {}

  async googleAuth(dto: GoogleAuthDto) {
    try {
      // Verify Google token
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${dto.idToken}`
      );

      // Validate audience — reject tokens issued for other Google apps
      const expectedClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      if (expectedClientId && response.data.aud !== expectedClientId) {
        throw new UnauthorizedException('Google token audience mismatch');
      }

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
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: refreshSecret,
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

  private generateTokens(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  }) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
    });

    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.get<string>('JWT_SECRET');
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
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
