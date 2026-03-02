import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly s3: S3Client | null = null;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID', '');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY', '');
    this.bucket = this.configService.get<string>('R2_BUCKET_NAME', 'luggageshare');
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL', '');

    if (!accountId || !accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are not configured. File uploads will fail at runtime.'
      );
      return;
    }

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(
      `R2 storage configured: bucket="${this.bucket}", publicUrl="${this.publicUrl}"`
    );
  }

  /**
   * Upload a file to Cloudflare R2.
   *
   * @param file   - Multer file object (memory storage, so file.buffer is populated)
   * @param bucket - Logical bucket category (e.g. "avatars", "images") — used as key prefix
   * @param folder - Sub-folder inside the category (e.g. "items", "proof")
   * @returns The public URL of the uploaded file
   */
  async uploadFile(file: Express.Multer.File, bucket: string, folder: string): Promise<string> {
    if (!this.s3) {
      throw new BadRequestException('File uploads are not configured. Missing R2 credentials.');
    }

    // --- Validate MIME type ---
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type "${file.mimetype}". Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }

    // --- Validate file size ---
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds the 5MB limit`
      );
    }

    // --- Generate unique key ---
    const ext = MIME_TO_EXT[file.mimetype] || 'bin';
    const uniqueId = crypto.randomUUID();
    const key = `${bucket}/${folder}/${uniqueId}-${Date.now()}.${ext}`;

    // --- Upload to R2 ---
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );
    } catch (err) {
      this.logger.error(`R2 upload failed: ${(err as Error).message}`, (err as Error).stack);
      throw new BadRequestException('File upload failed. Please try again later.');
    }

    // --- Build public URL ---
    const url = `${this.publicUrl}/${key}`;
    this.logger.log(`File uploaded: ${url}`);

    return url;
  }

  /**
   * Delete a file from Cloudflare R2.
   *
   * Silently logs a warning if the file is not found rather than throwing,
   * because the file may have already been deleted or the URL may be stale.
   *
   * @param url    - The full public URL of the file
   * @param bucket - Ignored (kept for backward compatibility); key is extracted from URL
   */
  async deleteFile(url: string, bucket: string): Promise<void> {
    if (!this.s3) {
      this.logger.warn('Cannot delete file: R2 is not configured.');
      return;
    }

    try {
      // Extract the key from the public URL.
      // URLs follow the pattern: <R2_PUBLIC_URL>/<key>
      if (!this.publicUrl || !url.startsWith(this.publicUrl)) {
        this.logger.warn(`Could not extract R2 key from URL: ${url}`);
        return;
      }

      const key = url.substring(this.publicUrl.length + 1); // +1 for the "/"

      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      this.logger.log(`File deleted: ${key}`);
    } catch (err) {
      this.logger.warn(`Unexpected error deleting file: ${(err as Error).message}`);
    }
  }
}
