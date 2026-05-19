import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './infra/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{ ok: boolean; db: boolean; uptime: number }> {
    let dbOk = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }
    return { ok: true, db: dbOk, uptime: process.uptime() };
  }
}
