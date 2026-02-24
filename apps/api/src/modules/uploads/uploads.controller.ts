import {
  Controller,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { UploadsService } from './uploads.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Upload or replace the authenticated user's avatar image.
   *
   * - Accepts a single file under the field name "file"
   * - Uploads to the "avatars" bucket in the "avatars" folder
   * - Deletes the previous avatar if one exists
   * - Updates user.avatarUrl in the database
   */
  @Post('avatar')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload or replace user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, or WebP, max 5 MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadAvatar(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const bucket = 'avatars';
    const folder = 'avatars';

    // Fetch current avatar so we can clean up the old one
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });

    // Upload new avatar
    const url = await this.uploadsService.uploadFile(file, bucket, folder);

    // Delete previous avatar (best-effort, won't throw)
    if (currentUser?.avatarUrl) {
      await this.uploadsService.deleteFile(currentUser.avatarUrl, bucket);
    }

    // Persist the new URL
    await this.prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: url },
    });

    return { url };
  }

  /**
   * Upload a generic image (items, proof of delivery, etc.).
   *
   * - Accepts a single file under the field name "file"
   * - The "folder" query parameter determines the sub-folder (defaults to "general")
   * - Uploads to the "images" bucket
   * - Returns the public URL; the caller is responsible for attaching it to the relevant record
   */
  @Post('image')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a generic image' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'folder',
    required: false,
    description: 'Sub-folder for organization (e.g. "items", "proof"). Defaults to "general".',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, or WebP, max 5 MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadImage(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const bucket = 'images';
    const safeFolder = this.sanitizeFolder(folder || 'general');

    const url = await this.uploadsService.uploadFile(file, bucket, safeFolder);

    return { url };
  }

  /**
   * Sanitize the folder query parameter to prevent path traversal.
   * Only allows alphanumeric characters, hyphens, and underscores.
   */
  private sanitizeFolder(folder: string): string {
    const sanitized = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    return sanitized || 'general';
  }
}
