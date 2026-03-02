import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';
import * as jsonwebtoken from 'jsonwebtoken';

jest.mock('axios');
jest.mock('jsonwebtoken');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedJwt = jsonwebtoken as jest.Mocked<typeof jsonwebtoken>;

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    isVerified: false,
  };

  const mockTokenResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      avatarUrl: mockUser.avatarUrl,
      isVerified: mockUser.isVerified,
    },
  };

  // Track Date.now offset to invalidate the module-level appleKeysCache between tests.
  // Each test advances time beyond the 24-hour TTL so getApplePublicKeys always re-fetches.
  let dateNowOffset = 0;
  const APPLE_KEYS_TTL_MS = 24 * 60 * 60 * 1000;
  const realDateNow = Date.now.bind(Date);

  beforeEach(async () => {
    // Advance time by more than the Apple keys TTL to invalidate any cached keys
    dateNowOffset += APPLE_KEYS_TTL_MS + 1;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              deleteMany: jest.fn().mockResolvedValue({}),
            },
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;

    jest.clearAllMocks();

    // Apply Date.now offset AFTER clearAllMocks to ensure it survives into the test
    jest.spyOn(Date, 'now').mockImplementation(() => realDateNow() + dateNowOffset);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('googleAuth', () => {
    const googleAuthDto = { idToken: 'valid-google-id-token' };

    const googleTokenInfo = {
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
      sub: 'google-sub-123',
      aud: 'valid-client-id',
    };

    beforeEach(() => {
      jwtService.sign
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
    });

    it('should verify Google token and return tokens for an existing user', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: googleTokenInfo });
      configService.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return 'valid-client-id';
        if (key === 'JWT_EXPIRES_IN') return defaultValue ?? '1h';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return defaultValue ?? '7d';
        return undefined;
      });
      usersService.findByEmail.mockResolvedValueOnce(mockUser as any);

      const result = await service.googleAuth(googleAuthDto);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${googleAuthDto.idToken}`
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.create).not.toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email, type: 'access' },
        { expiresIn: '1h' }
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: mockUser.id, email: mockUser.email, type: 'refresh' }),
        expect.objectContaining({ expiresIn: '7d' })
      );
      expect(result).toEqual(mockTokenResponse);
    });

    it('should create a new user when one does not exist', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: googleTokenInfo });
      configService.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return 'valid-client-id';
        if (key === 'JWT_EXPIRES_IN') return defaultValue ?? '1h';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return defaultValue ?? '7d';
        return undefined;
      });
      usersService.findByEmail.mockResolvedValueOnce(null);
      usersService.create.mockResolvedValueOnce(mockUser as any);

      const result = await service.googleAuth(googleAuthDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        googleId: 'google-sub-123',
        provider: 'google',
      });
      expect(result).toEqual(mockTokenResponse);
    });

    it('should throw UnauthorizedException when audience does not match GOOGLE_CLIENT_ID', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { ...googleTokenInfo, aud: 'wrong-client-id' },
      });
      configService.get.mockImplementation((key: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return 'valid-client-id';
        return undefined;
      });

      await expect(service.googleAuth(googleAuthDto)).rejects.toThrow(
        new UnauthorizedException('Google token audience mismatch')
      );
    });

    it('should skip audience check when GOOGLE_CLIENT_ID is not configured', async () => {
      const tokenInfoWithDifferentAud = {
        ...googleTokenInfo,
        aud: 'any-client-id-should-work',
      };
      mockedAxios.get.mockResolvedValueOnce({ data: tokenInfoWithDifferentAud });
      configService.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return undefined;
        if (key === 'JWT_EXPIRES_IN') return defaultValue ?? '1h';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return defaultValue ?? '7d';
        return undefined;
      });
      usersService.findByEmail.mockResolvedValueOnce(mockUser as any);

      const result = await service.googleAuth(googleAuthDto);

      expect(result).toEqual(mockTokenResponse);
    });

    it('should throw UnauthorizedException when Google token verification fails (axios error)', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.googleAuth(googleAuthDto)).rejects.toThrow(
        new UnauthorizedException('Invalid Google token')
      );
    });

    it('should use default JWT expiration values when config values are absent', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: googleTokenInfo });
      configService.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return 'valid-client-id';
        return defaultValue;
      });
      usersService.findByEmail.mockResolvedValueOnce(mockUser as any);

      await service.googleAuth(googleAuthDto);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email, type: 'access' },
        { expiresIn: '1h' }
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: mockUser.id, email: mockUser.email, type: 'refresh' }),
        expect.objectContaining({ expiresIn: '7d' })
      );
    });
  });

  describe('appleAuth', () => {
    // Create a fake JWT header with a kid, base64url-encoded
    const fakeHeader = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'apple-key-1' })).toString(
      'base64url'
    );
    const fakePayload = Buffer.from(
      JSON.stringify({ email: 'apple@example.com', sub: 'apple-sub-123' })
    ).toString('base64url');
    const fakeSignature = 'fake-signature';
    const fakeIdentityToken = `${fakeHeader}.${fakePayload}.${fakeSignature}`;

    const appleAuthDto = {
      identityToken: fakeIdentityToken,
      authorizationCode: 'apple-auth-code',
      fullName: {
        givenName: 'Jane',
        familyName: 'Doe',
      },
    };

    const applePublicKeys = {
      data: {
        keys: [
          {
            kty: 'RSA',
            kid: 'apple-key-1',
            n: 'test-n-value',
            e: 'AQAB',
          },
          {
            kty: 'RSA',
            kid: 'apple-key-2',
            n: 'another-n-value',
            e: 'AQAB',
          },
        ],
      },
    };

    const decodedAppleToken = {
      email: 'apple@example.com',
      sub: 'apple-sub-123',
      iss: 'https://appleid.apple.com',
      aud: 'com.luggageshare.app',
    };

    const mockAppleUser = {
      id: 'user-456',
      email: 'apple@example.com',
      name: 'Jane Doe',
      avatarUrl: null,
      isVerified: false,
    };

    beforeEach(() => {
      jwtService.sign
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');

      // Mock crypto.createPublicKey by mocking jwkToPem's internal behavior
      // The service calls crypto.createPublicKey, which will fail on fake keys,
      // so we need to intercept at the jwt.verify level instead
    });

    it('should verify Apple token and return tokens for an existing user', async () => {
      mockedAxios.get.mockResolvedValueOnce(applePublicKeys);
      configService.get.mockImplementation((key: string) => {
        if (key === 'APPLE_CLIENT_ID') return 'com.luggageshare.app';
        return undefined;
      });

      // Mock crypto.createPublicKey indirectly by mocking the jwkToPem result
      // We need to mock the entire flow: the service calls jwkToPem which calls crypto.createPublicKey
      // Then it passes the PEM to jwt.verify. We mock jwt.verify to accept any key and return decoded token.
      const cryptoSpy = jest.spyOn(require('crypto'), 'createPublicKey').mockReturnValue({
        export: jest
          .fn()
          .mockReturnValue('-----BEGIN PUBLIC KEY-----\nfake\n-----END PUBLIC KEY-----'),
      } as any);

      mockedJwt.verify.mockImplementation(
        (_token: string, _key: any, _options: any, callback: any) => {
          callback(null, decodedAppleToken);
        }
      );

      usersService.findByEmail.mockResolvedValueOnce(mockAppleUser as any);

      const result = await service.appleAuth(appleAuthDto);

      expect(mockedAxios.get).toHaveBeenCalledWith('https://appleid.apple.com/auth/keys');
      expect(usersService.findByEmail).toHaveBeenCalledWith('apple@example.com');
      expect(usersService.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: mockAppleUser.id,
          email: mockAppleUser.email,
          name: mockAppleUser.name,
          avatarUrl: mockAppleUser.avatarUrl,
          isVerified: mockAppleUser.isVerified,
        },
      });

      cryptoSpy.mockRestore();
    });

    it('should create a new user with name from dto.fullName', async () => {
      mockedAxios.get.mockResolvedValueOnce(applePublicKeys);
      configService.get.mockImplementation((key: string) => {
        if (key === 'APPLE_CLIENT_ID') return 'com.luggageshare.app';
        return undefined;
      });

      const cryptoSpy = jest.spyOn(require('crypto'), 'createPublicKey').mockReturnValue({
        export: jest
          .fn()
          .mockReturnValue('-----BEGIN PUBLIC KEY-----\nfake\n-----END PUBLIC KEY-----'),
      } as any);

      mockedJwt.verify.mockImplementation(
        (_token: string, _key: any, _options: any, callback: any) => {
          callback(null, decodedAppleToken);
        }
      );

      usersService.findByEmail.mockResolvedValueOnce(null);
      usersService.create.mockResolvedValueOnce(mockAppleUser as any);

      const result = await service.appleAuth(appleAuthDto);

      expect(usersService.create).toHaveBeenCalledWith({
        email: 'apple@example.com',
        name: 'Jane Doe',
        appleId: 'apple-sub-123',
        provider: 'apple',
      });
      expect(result.user.email).toBe('apple@example.com');

      cryptoSpy.mockRestore();
    });

    it('should default to "User" name when fullName is not provided', async () => {
      const dtoWithoutName = {
        identityToken: fakeIdentityToken,
        authorizationCode: 'apple-auth-code',
      };

      mockedAxios.get.mockResolvedValueOnce(applePublicKeys);
      configService.get.mockImplementation((key: string) => {
        if (key === 'APPLE_CLIENT_ID') return 'com.luggageshare.app';
        return undefined;
      });

      const cryptoSpy = jest.spyOn(require('crypto'), 'createPublicKey').mockReturnValue({
        export: jest
          .fn()
          .mockReturnValue('-----BEGIN PUBLIC KEY-----\nfake\n-----END PUBLIC KEY-----'),
      } as any);

      mockedJwt.verify.mockImplementation(
        (_token: string, _key: any, _options: any, callback: any) => {
          callback(null, decodedAppleToken);
        }
      );

      const userWithDefaultName = { ...mockAppleUser, name: 'User' };
      usersService.findByEmail.mockResolvedValueOnce(null);
      usersService.create.mockResolvedValueOnce(userWithDefaultName as any);

      await service.appleAuth(dtoWithoutName);

      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'User' }));

      cryptoSpy.mockRestore();
    });

    it('should default to "User" name when fullName.givenName is empty', async () => {
      const dtoWithEmptyName = {
        identityToken: fakeIdentityToken,
        authorizationCode: 'apple-auth-code',
        fullName: { givenName: '', familyName: 'Doe' },
      };

      mockedAxios.get.mockResolvedValueOnce(applePublicKeys);
      configService.get.mockImplementation((key: string) => {
        if (key === 'APPLE_CLIENT_ID') return 'com.luggageshare.app';
        return undefined;
      });

      const cryptoSpy = jest.spyOn(require('crypto'), 'createPublicKey').mockReturnValue({
        export: jest
          .fn()
          .mockReturnValue('-----BEGIN PUBLIC KEY-----\nfake\n-----END PUBLIC KEY-----'),
      } as any);

      mockedJwt.verify.mockImplementation(
        (_token: string, _key: any, _options: any, callback: any) => {
          callback(null, decodedAppleToken);
        }
      );

      const userWithDefaultName = { ...mockAppleUser, name: 'User' };
      usersService.findByEmail.mockResolvedValueOnce(null);
      usersService.create.mockResolvedValueOnce(userWithDefaultName as any);

      await service.appleAuth(dtoWithEmptyName);

      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'User' }));

      cryptoSpy.mockRestore();
    });

    it('should use only givenName when familyName is absent', async () => {
      const dtoWithGivenNameOnly = {
        identityToken: fakeIdentityToken,
        authorizationCode: 'apple-auth-code',
        fullName: { givenName: 'Jane' },
      };

      mockedAxios.get.mockResolvedValueOnce(applePublicKeys);
      configService.get.mockImplementation((key: string) => {
        if (key === 'APPLE_CLIENT_ID') return 'com.luggageshare.app';
        return undefined;
      });

      const cryptoSpy = jest.spyOn(require('crypto'), 'createPublicKey').mockReturnValue({
        export: jest
          .fn()
          .mockReturnValue('-----BEGIN PUBLIC KEY-----\nfake\n-----END PUBLIC KEY-----'),
      } as any);

      mockedJwt.verify.mockImplementation(
        (_token: string, _key: any, _options: any, callback: any) => {
          callback(null, decodedAppleToken);
        }
      );

      const userWithFirstNameOnly = { ...mockAppleUser, name: 'Jane' };
      usersService.findByEmail.mockResolvedValueOnce(null);
      usersService.create.mockResolvedValueOnce(userWithFirstNameOnly as any);

      await service.appleAuth(dtoWithGivenNameOnly);

      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane' }));

      cryptoSpy.mockRestore();
    });

    it('should throw UnauthorizedException when Apple token verification fails', async () => {
      mockedAxios.get.mockResolvedValueOnce(applePublicKeys);
      configService.get.mockImplementation((key: string) => {
        if (key === 'APPLE_CLIENT_ID') return 'com.luggageshare.app';
        return undefined;
      });

      const cryptoSpy = jest.spyOn(require('crypto'), 'createPublicKey').mockReturnValue({
        export: jest
          .fn()
          .mockReturnValue('-----BEGIN PUBLIC KEY-----\nfake\n-----END PUBLIC KEY-----'),
      } as any);

      mockedJwt.verify.mockImplementation(
        (_token: string, _key: any, _options: any, callback: any) => {
          callback(new Error('Token expired'), null);
        }
      );

      await expect(service.appleAuth(appleAuthDto)).rejects.toThrow(UnauthorizedException);

      cryptoSpy.mockRestore();
    });

    it('should throw UnauthorizedException when decoded token has no email', async () => {
      mockedAxios.get.mockResolvedValueOnce(applePublicKeys);
      configService.get.mockImplementation((key: string) => {
        if (key === 'APPLE_CLIENT_ID') return 'com.luggageshare.app';
        return undefined;
      });

      const cryptoSpy = jest.spyOn(require('crypto'), 'createPublicKey').mockReturnValue({
        export: jest
          .fn()
          .mockReturnValue('-----BEGIN PUBLIC KEY-----\nfake\n-----END PUBLIC KEY-----'),
      } as any);

      mockedJwt.verify.mockImplementation(
        (_token: string, _key: any, _options: any, callback: any) => {
          callback(null, { sub: 'apple-sub-123' }); // no email field
        }
      );

      await expect(service.appleAuth(appleAuthDto)).rejects.toThrow(UnauthorizedException);

      cryptoSpy.mockRestore();
    });

    it('should throw UnauthorizedException when Apple token header has no kid', async () => {
      const headerWithoutKid = Buffer.from(JSON.stringify({ alg: 'RS256' })).toString('base64url');
      const tokenWithoutKid = `${headerWithoutKid}.${fakePayload}.${fakeSignature}`;

      const dtoWithBadToken = {
        identityToken: tokenWithoutKid,
        authorizationCode: 'apple-auth-code',
      };

      await expect(service.appleAuth(dtoWithBadToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when Apple key matching kid is not found', async () => {
      const headerWithUnknownKid = Buffer.from(
        JSON.stringify({ alg: 'RS256', kid: 'unknown-kid' })
      ).toString('base64url');
      const tokenWithUnknownKid = `${headerWithUnknownKid}.${fakePayload}.${fakeSignature}`;

      const dtoWithUnknownKid = {
        identityToken: tokenWithUnknownKid,
        authorizationCode: 'apple-auth-code',
      };

      mockedAxios.get.mockResolvedValueOnce(applePublicKeys);

      await expect(service.appleAuth(dtoWithUnknownKid)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when fetching Apple public keys fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.appleAuth(appleAuthDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = { refreshToken: 'valid-refresh-token' };

    beforeEach(() => {
      jwtService.sign
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');
    });

    let prismaService: any;

    beforeEach(() => {
      prismaService = (service as any).prisma;
    });

    it('should return new tokens for a valid refresh token', async () => {
      const storedToken = {
        id: 'rt-1',
        tokenHash: 'hashed',
        family: 'family-1',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000),
      };

      jwtService.verify.mockReturnValueOnce({
        sub: 'user-123',
        email: 'test@example.com',
        type: 'refresh',
      });
      configService.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        if (key === 'JWT_EXPIRES_IN') return defaultValue ?? '1h';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return defaultValue ?? '7d';
        return undefined;
      });
      prismaService.refreshToken.findUnique.mockResolvedValueOnce(storedToken);
      prismaService.refreshToken.update.mockResolvedValueOnce({});
      prismaService.refreshToken.create.mockResolvedValueOnce({});
      usersService.findById.mockResolvedValueOnce(mockUser as any);

      const result = await service.refreshToken(refreshTokenDto);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'test-refresh-secret',
      });
      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockTokenResponse);
    });

    it('should throw UnauthorizedException when refresh token is invalid or expired', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        return undefined;
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token')
      );
    });

    it('should throw UnauthorizedException when token type is not refresh', async () => {
      jwtService.verify.mockReturnValueOnce({
        sub: 'user-123',
        email: 'test@example.com',
        type: 'access',
      });
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        return undefined;
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Invalid token type')
      );
    });

    it('should throw UnauthorizedException when token not found in DB', async () => {
      jwtService.verify.mockReturnValueOnce({
        sub: 'user-123',
        email: 'test@example.com',
        type: 'refresh',
      });
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        return undefined;
      });
      prismaService.refreshToken.findUnique.mockResolvedValueOnce(null);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Token not found')
      );
    });

    it('should revoke entire family on token reuse detection', async () => {
      const revokedToken = {
        id: 'rt-1',
        tokenHash: 'hashed',
        family: 'family-1',
        isRevoked: true,
        expiresAt: new Date(Date.now() + 86400000),
      };

      jwtService.verify.mockReturnValueOnce({
        sub: 'user-123',
        email: 'test@example.com',
        type: 'refresh',
      });
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        return undefined;
      });
      prismaService.refreshToken.findUnique.mockResolvedValueOnce(revokedToken);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Token reuse detected')
      );
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { family: 'family-1' },
        data: { isRevoked: true },
      });
    });
  });

  describe('generateTokens (via public methods)', () => {
    it('should generate access and refresh tokens with correct payload structure', async () => {
      const googleAuthDto = { idToken: 'valid-google-id-token' };
      const googleTokenInfo = {
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
        sub: 'google-sub-123',
        aud: 'valid-client-id',
      };

      mockedAxios.get.mockResolvedValueOnce({ data: googleTokenInfo });
      configService.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return 'valid-client-id';
        if (key === 'JWT_EXPIRES_IN') return '2h';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '14d';
        return defaultValue;
      });
      usersService.findByEmail.mockResolvedValueOnce(mockUser as any);

      jwtService.sign
        .mockReturnValueOnce('custom-access-token')
        .mockReturnValueOnce('custom-refresh-token');

      const result = await service.googleAuth(googleAuthDto);

      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        { sub: 'user-123', email: 'test@example.com', type: 'access' },
        { expiresIn: '2h' }
      );
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ sub: 'user-123', email: 'test@example.com', type: 'refresh' }),
        expect.objectContaining({ expiresIn: '14d' })
      );
      expect(result.accessToken).toBe('custom-access-token');
      expect(result.refreshToken).toBe('custom-refresh-token');
    });

    it('should return the user object with correct fields in the response', async () => {
      const googleAuthDto = { idToken: 'valid-google-id-token' };
      const googleTokenInfo = {
        email: 'verified@example.com',
        name: 'Verified User',
        picture: null,
        sub: 'google-sub-789',
        aud: 'valid-client-id',
      };

      const verifiedUser = {
        id: 'user-789',
        email: 'verified@example.com',
        name: 'Verified User',
        avatarUrl: null,
        isVerified: true,
      };

      mockedAxios.get.mockResolvedValueOnce({ data: googleTokenInfo });
      configService.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return 'valid-client-id';
        return defaultValue;
      });
      usersService.findByEmail.mockResolvedValueOnce(verifiedUser as any);

      jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.googleAuth(googleAuthDto);

      expect(result.user).toEqual({
        id: 'user-789',
        email: 'verified@example.com',
        name: 'Verified User',
        avatarUrl: null,
        isVerified: true,
      });
    });
  });
});
