import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as path from 'path';

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
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL', '');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY', '');

    if (!supabaseUrl || !supabaseServiceKey) {
      this.logger.warn(
        'SUPABASE_URL or SUPABASE_SERVICE_KEY is not configured. File uploads will fail at runtime.'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  /**
   * Upload a file to Supabase Storage.
   *
   * @param file   - Multer file object (memory storage, so file.buffer is populated)
   * @param bucket - Supabase Storage bucket name (e.g. "avatars", "images")
   * @param folder - Logical sub-folder inside the bucket (e.g. "items", "proof")
   * @returns The public URL of the uploaded file
   */
  async uploadFile(file: Express.Multer.File, bucket: string, folder: string): Promise<string> {
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

    // --- Generate unique path ---
    const ext = MIME_TO_EXT[file.mimetype] || 'bin';
    const uniqueId = crypto.randomUUID();
    const filePath = `${folder}/${uniqueId}-${Date.now()}.${ext}`;

    // --- Upload to Supabase Storage ---
    const { error } = await this.supabase.storage.from(bucket).upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

    if (error) {
      this.logger.error(`Supabase upload failed: ${error.message}`, error);
      throw new BadRequestException('File upload failed. Please try again later.');
    }

    // --- Build public URL ---
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(filePath);

    this.logger.log(`File uploaded: ${publicUrl}`);

    return publicUrl;
  }

  /**
   * Delete a file from Supabase Storage.
   *
   * Silently logs a warning if the file is not found rather than throwing,
   * because the file may have already been deleted or the URL may be stale.
   *
   * @param url    - The full public URL of the file
   * @param bucket - The Supabase Storage bucket the file lives in
   */
  async deleteFile(url: string, bucket: string): Promise<void> {
    try {
      // Extract the storage path from the public URL.
      // Public URLs follow the pattern:
      //   <SUPABASE_URL>/storage/v1/object/public/<bucket>/<path>
      const marker = `/storage/v1/object/public/${bucket}/`;
      const markerIndex = url.indexOf(marker);

      if (markerIndex === -1) {
        this.logger.warn(`Could not extract storage path from URL: ${url}`);
        return;
      }

      const storagePath = url.substring(markerIndex + marker.length);

      const { error } = await this.supabase.storage.from(bucket).remove([storagePath]);

      if (error) {
        this.logger.warn(
          `Failed to delete file "${storagePath}" from bucket "${bucket}": ${error.message}`
        );
        return;
      }

      this.logger.log(`File deleted: ${storagePath}`);
    } catch (err) {
      this.logger.warn(
        `Unexpected error deleting file from "${bucket}": ${(err as Error).message}`
      );
    }
  }
}
