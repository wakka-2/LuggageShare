import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadsService } from './uploads.service';

const mockConfigService = () => ({
  get: jest.fn((key: string, defaultValue?: string) => {
    const config: Record<string, string> = {
      R2_ACCOUNT_ID: 'test-account',
      R2_ACCESS_KEY_ID: 'test-key',
      R2_SECRET_ACCESS_KEY: 'test-secret',
      R2_BUCKET_NAME: 'luggageshare',
      R2_PUBLIC_URL: 'https://cdn.luggageshare.com',
    };
    return config[key] ?? defaultValue ?? '';
  }),
});

// Mock S3Client
const mockSend = jest.fn().mockResolvedValue({});
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  PutObjectCommand: jest.fn().mockImplementation((params) => params),
  DeleteObjectCommand: jest.fn().mockImplementation((params) => params),
}));

// JPEG magic bytes: FF D8 FF
const JPEG_BUFFER = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

// PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
const PNG_BUFFER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);

// WebP magic bytes: RIFF...WEBP
const WEBP_BUFFER = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);

// Invalid file (text content claiming to be image)
const FAKE_JPEG_BUFFER = Buffer.from('This is not a JPEG file at all');

const makeFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
  ({
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: JPEG_BUFFER,
    size: JPEG_BUFFER.length,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  }) as Express.Multer.File;

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService, { provide: ConfigService, useFactory: mockConfigService }],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a valid JPEG file', async () => {
      const url = await service.uploadFile(makeFile(), 'avatars', 'profile');

      expect(url).toContain('https://cdn.luggageshare.com/avatars/profile/');
      expect(url).toMatch(/\.jpg$/);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should upload a valid PNG file', async () => {
      const file = makeFile({
        mimetype: 'image/png',
        buffer: PNG_BUFFER,
        size: PNG_BUFFER.length,
        originalname: 'test.png',
      });

      const url = await service.uploadFile(file, 'images', 'items');

      expect(url).toMatch(/\.png$/);
    });

    it('should upload a valid WebP file', async () => {
      const file = makeFile({
        mimetype: 'image/webp',
        buffer: WEBP_BUFFER,
        size: WEBP_BUFFER.length,
        originalname: 'test.webp',
      });

      const url = await service.uploadFile(file, 'images', 'items');

      expect(url).toMatch(/\.webp$/);
    });

    it('should reject disallowed MIME types', async () => {
      const file = makeFile({
        mimetype: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4'),
      });

      await expect(service.uploadFile(file, 'images', 'items')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should reject files exceeding 5MB', async () => {
      const file = makeFile({
        size: 6 * 1024 * 1024,
      });

      await expect(service.uploadFile(file, 'images', 'items')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should reject files where magic bytes do not match declared MIME type', async () => {
      const file = makeFile({
        mimetype: 'image/jpeg',
        buffer: FAKE_JPEG_BUFFER,
        size: FAKE_JPEG_BUFFER.length,
      });

      await expect(service.uploadFile(file, 'images', 'items')).rejects.toThrow(
        'File content does not match declared type'
      );
    });

    it('should reject PNG buffer declared as JPEG', async () => {
      const file = makeFile({
        mimetype: 'image/jpeg',
        buffer: PNG_BUFFER,
        size: PNG_BUFFER.length,
      });

      await expect(service.uploadFile(file, 'images', 'items')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should not call S3 when validation fails', async () => {
      const file = makeFile({
        mimetype: 'image/jpeg',
        buffer: FAKE_JPEG_BUFFER,
        size: FAKE_JPEG_BUFFER.length,
      });

      await expect(service.uploadFile(file, 'images', 'items')).rejects.toThrow();

      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('should delete a file from R2', async () => {
      await service.deleteFile(
        'https://cdn.luggageshare.com/avatars/profile/uuid-123.jpg',
        'avatars'
      );

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should not throw when URL does not match public URL', async () => {
      await expect(
        service.deleteFile('https://evil.com/file.jpg', 'avatars')
      ).resolves.toBeUndefined();

      expect(mockSend).not.toHaveBeenCalled();
    });
  });
});
