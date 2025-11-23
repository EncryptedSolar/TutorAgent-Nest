import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { UserEventDTO } from './user-event.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class UserEventService {
  private readonly logger = new Logger(UserEventService.name);

  constructor(private readonly prisma: PrismaService) { }

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

  // ────────────────────────────────
  // 2️⃣ FIND ALL EVENTS (for admin resolver)
  // ────────────────────────────────
  async findAll(params: {
    page: number;
    limit: number;
    userId?: string;
    action?: string;
    component?: string;
  }) {
    const { page, limit, userId, action, component } = params;

    const where: Prisma.UserEventWhereInput = {};

    if (userId) where.userId = userId;
    if (action) where.action = { contains: action };
    if (component) where.component = { contains: component };

    const [events, total] = await this.prisma.$transaction([
      this.prisma.userEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userEvent.count({ where }),
    ]);

    this.logger.verbose(`Fetched ${events.length} events (total: ${total})`);

    return { events, total };
  }


  async createUserEvent(event: UserEventDTO) {
    await this.prisma.userEvent.create({
      data: {
        id: event.id,
        userId: event.userId,
        sessionId: event.sessionId,
        component: event.component,
        action: event.action,
        metadata: event.metadata,
        createdAt: event.createdAt
      },
    });
  }

}
