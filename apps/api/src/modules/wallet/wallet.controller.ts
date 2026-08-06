import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { WalletHistoryQueryDto } from './dto/wallet-query.dto';
import { TopUpRequestDto } from './dto/topup-request.dto';
import { RejectTopUpDto } from './dto/reject-topup.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get credit balance' })
  async getBalance(@CurrentUser() user: any) {
    return this.walletService.getBalance(user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get credit transaction history' })
  async getHistory(@CurrentUser() user: any, @Query() query: WalletHistoryQueryDto) {
    return this.walletService.getHistory(user.id, query);
  }

  @Post('topup')
  @ApiOperation({ summary: 'Request a credit top-up (returns bank transfer details)' })
  @ApiResponse({ status: 201, description: 'Pending top-up created with payout details' })
  async requestTopUp(@CurrentUser() user: any, @Body() dto: TopUpRequestDto) {
    return this.walletService.requestTopUp(user.id, dto);
  }

  @Get('topups')
  @ApiOperation({ summary: "List the current user's top-up requests" })
  async getMyTopUps(@CurrentUser() user: any) {
    return this.walletService.getMyTopUps(user.id);
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  @Get('admin/topups/pending')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[admin] List pending top-up requests' })
  async getPendingTopUps() {
    return this.walletService.getPendingTopUps();
  }

  @Post('admin/topups/:id/confirm')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[admin] Confirm a top-up and credit the user' })
  async confirmTopUp(@CurrentUser() user: any, @Param('id') id: string) {
    return this.walletService.confirmTopUp(user.id, id);
  }

  @Post('admin/topups/:id/reject')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[admin] Reject a top-up request' })
  async rejectTopUp(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RejectTopUpDto
  ) {
    return this.walletService.rejectTopUp(user.id, id, dto.reason);
  }
}
