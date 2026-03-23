import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma as any),
      () => this.memory.checkHeap('memory_heap', 256 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness check for load balancers' })
  @ApiResponse({ status: 200, description: 'API is ready to serve traffic' })
  readiness() {
    return this.health.check([() => this.prismaHealth.pingCheck('database', this.prisma as any)]);
  }
}
