import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerificationRequestDto } from './dto/verification-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  async getCurrentUser(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateCurrentUser(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Post('me/accept-tos')
  @ApiOperation({ summary: 'Accept Terms of Service' })
  @ApiResponse({ status: 200, description: 'ToS accepted' })
  async acceptTos(@CurrentUser() user: any) {
    return this.usersService.acceptTos(user.id);
  }

  @Get('me/verification')
  @ApiOperation({ summary: 'Get verification status' })
  @ApiResponse({ status: 200, description: 'Returns verification status' })
  async getVerificationStatus(@CurrentUser() user: any) {
    return this.usersService.getVerificationStatus(user.id);
  }

  @Post('me/verify')
  @ApiOperation({ summary: 'Submit verification request' })
  @ApiResponse({ status: 200, description: 'Verification request submitted' })
  @ApiResponse({ status: 400, description: 'Already verified' })
  async requestVerification(@CurrentUser() user: any, @Body() dto: VerificationRequestDto) {
    return this.usersService.requestVerification(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public user profile by ID' })
  @ApiResponse({ status: 200, description: 'Returns public user profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }
}
