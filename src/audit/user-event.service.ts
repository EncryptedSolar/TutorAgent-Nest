import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserEventService {
  private readonly logger = new Logger(UserEventService.name);

  async log(params: {
    userId: string;
    sessionId?: string;
    component: string;
    action: string;
    metadata?: Record<string, any>;
  }) {
    try {
      await this.prisma.userEvent.create({
        data: {
          userId: params.userId,
          sessionId: params.sessionId ?? null,
          component: params.component,
          action: params.action,
          metadata: params.metadata ?? {},
        },
      });

      this.logger.verbose(`[${params.component}] ${params.action} logged for ${params.userId}`);
    } catch (err) {
      this.logger.error(`Failed to log event ${params.action}: ${err.message}`);
    }
  }

  constructor(private readonly prisma: PrismaService) {}
}
