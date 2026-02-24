import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { WalletHistoryQueryDto } from './dto/wallet-query.dto';
import { WithdrawalRequestDto } from './dto/withdrawal-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Returns current balance' })
  async getBalance(@CurrentUser() user: any) {
    return this.walletService.getBalance(user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, description: 'Returns transaction history' })
  async getHistory(@CurrentUser() user: any, @Query() query: WalletHistoryQueryDto) {
    return this.walletService.getHistory(user.id, query);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Request a withdrawal to bank account' })
  @ApiResponse({ status: 201, description: 'Withdrawal request submitted' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or invalid IBAN' })
  async requestWithdrawal(@CurrentUser() user: any, @Body() dto: WithdrawalRequestDto) {
    return this.walletService.requestWithdrawal(user.id, dto);
  }
}
