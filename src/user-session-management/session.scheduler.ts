import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class SessionSchedulerService {
  private readonly logger = new Logger(SessionSchedulerService.name);
  private readonly idleTimeoutMs: number;
  private readonly offlineTimeoutMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const idleMinutes = Number(this.configService.get('session.sessionIdleTimeoutMinutes')) || 15;
    const offlineMinutes = Number(this.configService.get('session.sessionOfflineTimeoutMinutes')) || 60;

    this.idleTimeoutMs = idleMinutes * 60 * 1000;
    this.offlineTimeoutMs = offlineMinutes * 60 * 1000;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleSessionTimeouts() {
    const now = new Date();
    const idleThreshold = new Date(now.getTime() - this.idleTimeoutMs);
    const offlineThreshold = new Date(now.getTime() - this.offlineTimeoutMs);

    // 1️⃣ Mark IDLE sessions
    const idleResult = await this.prisma.userSession.updateMany({
      where: {
        status: SessionStatus.ACTIVE,
        lastActivity: { lt: idleThreshold },
      },
      data: { status: SessionStatus.IDLE },
    });

    // 2️⃣ Mark OFFLINE sessions
    const offlineResult = await this.prisma.userSession.updateMany({
      where: {
        status: { in: [SessionStatus.ACTIVE, SessionStatus.IDLE] },
        lastActivity: { lt: offlineThreshold },
      },
      data: { status: SessionStatus.OFFLINE },
    });

    if (idleResult.count > 0 || offlineResult.count > 0) {
      this.logger.log(
        `Session cleanup complete — IDLE: ${idleResult.count}, OFFLINE: ${offlineResult.count}`,
      );
    }
  }
}
