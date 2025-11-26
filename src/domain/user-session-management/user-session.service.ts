import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AuditAction, AuditComponent } from 'src/common/enums/audit.enum';
import { Prisma, Role, SessionStatus, UserSession } from 'generated/prisma/client';
import { UserEventService } from '../audit/user-event.service';

@Injectable()
export class UserSessionService {
  private readonly logger = new Logger(UserSessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userEventService: UserEventService,
  ) { }

  // ────────────────────────────────
  // SECTION 1: Core Session Lifecycle
  // ────────────────────────────────

  async createSession(params: {
    userId: string;
    role: Role;
    jwtId: string | null;
    ipAddress?: string;
    deviceInfo?: string;
    channel?: 'REST' | 'SOCKET' | 'OTHER';
  }): Promise<UserSession> {
    try {
      const session = await this.prisma.userSession.create({
        data: {
          ...params,
          channel: params.channel ?? 'REST',
          status: SessionStatus.ACTIVE,
          loginAt: new Date(),
          lastActivity: new Date(),
        },
      });

      await this.userEventService.log({
        userId: session.userId,
        sessionId: session.id,
        action: AuditAction.LOGIN,
        metadata: {
          ipAddress: session.ipAddress,
          deviceInfo: session.deviceInfo,
          channel: session.channel,
        },
      });

      this.logger.log(
        `✅ New ${session.channel} session created for user ${params.userId} (${params.role})`,
      );

      return session;
    } catch (err) {
      this.logger.error(`❌ Failed to create session for user ${params.userId}: ${err.message}`);
      throw err;
    }
  }

  async updateActivity(jwtId: string, socketId?: string): Promise<UserSession | null> {
    try {
      const session = await this.prisma.userSession.findUnique({ where: { jwtId } });
      if (!session) return null;

      const updated = await this.prisma.userSession.update({
        where: { id: session.id },
        data: {
          lastActivity: new Date(),
          status: SessionStatus.ACTIVE,
          socketId: socketId ?? session.socketId,
          updatedAt: new Date(),
        },
      });

      await this.userEventService.log({
        userId: session.userId,
        sessionId: session.id,
        action: AuditAction.UPDATE_ACTIVITY,
        metadata: { socketId },
      });

      return updated;
    } catch (err) {
      this.logger.error(`❌ Failed to update activity for JWT ${jwtId}: ${err.message}`);
      throw err;
    }
  }

  // ────────────────────────────────
  // SECTION 2: State Management
  // ────────────────────────────────

  async markIdle(sessionId: string): Promise<UserSession | null> {
    return this.safeUpdate(sessionId, SessionStatus.IDLE, AuditAction.MARK_IDLE);
  }

  async markOffline(sessionId: string): Promise<UserSession | null> {
    return this.safeUpdate(sessionId, SessionStatus.OFFLINE, AuditAction.MARK_OFFLINE);
  }

  async terminateSession(sessionId: string): Promise<void> {
    try {
      const session = await this.prisma.userSession.findUnique({ where: { id: sessionId } });
      if (!session) return;

      const now = new Date();
      const durationSeconds = Math.floor(
        (now.getTime() - new Date(session.loginAt).getTime()) / 1000,
      );

      await this.prisma.userSession.update({
        where: { id: sessionId },
        data: {
          status: SessionStatus.TERMINATED,
          terminatedAt: now,
          duration: durationSeconds,
        },
      });

      await this.userEventService.log({
        userId: session.userId,
        sessionId: session.id,
        action: AuditAction.TERMINATE,
        metadata: { durationSeconds },
      });

      this.logger.log(
        `🟥 Session ${sessionId} terminated after ${durationSeconds}s`,
      );
    } catch (err) {
      this.logger.error(`❌ Failed to terminate session ${sessionId}: ${err.message}`);
      throw err;
    }
  }

  // ────────────────────────────────
  // SECTION 3: Retrieval / Queries
  // ────────────────────────────────

  async getSessionById(sessionId: string): Promise<UserSession | null> {
    return this.prisma.userSession.findUnique({ where: { id: sessionId } });
  }

  async findByJwtId(jwtId: string): Promise<UserSession | null> {
    return this.prisma.userSession.findUnique({ where: { jwtId } });
  }

  async getSessionsByUser(userId: string): Promise<UserSession[]> {
    return this.prisma.userSession.findMany({ where: { userId } });
  }

  async getActiveSessions(): Promise<UserSession[]> {
    return this.prisma.userSession.findMany({ where: { status: SessionStatus.ACTIVE } });
  }

  async getAllSessions(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;

    const where: Prisma.UserSessionWhereInput = search
      ? {
        OR: [
          { userId: { contains: search } },
          { ipAddress: { contains: search } },
          { deviceInfo: { contains: search } },
        ],
      }
      : {};

    const [sessions, total] = await this.prisma.$transaction([
      this.prisma.userSession.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { loginAt: 'desc' },
      }),
      this.prisma.userSession.count({ where }),
    ]);

    return { sessions, total };
  }

  // ────────────────────────────────
  // SECTION 4: Utility Helpers
  // ────────────────────────────────

  async refreshSessionActivity(
    userId: string,
    channel: 'REST' | 'SOCKET',
    socketId?: string,
  ): Promise<UserSession | null> {
    const activeSessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        status: { in: [SessionStatus.ACTIVE, SessionStatus.IDLE, SessionStatus.OFFLINE] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const target =
      activeSessions.find((s) => s.channel === channel) ??
      activeSessions.find((s) => s.status === SessionStatus.ACTIVE) ??
      activeSessions[0];

    if (!target) return null;
    return this.updateActivity(target.jwtId!, socketId);
  }

  async attachSocket(jwtId: string, socketId: string) {
    try {
      const session = await this.prisma.userSession.update({
        where: { jwtId },
        data: { socketId },
      });

      await this.userEventService.log({
        userId: session.userId,
        sessionId: session.id,
        action: AuditAction.ATTACH_SOCKET,
        metadata: { socketId },
      });

      return session;
    } catch (err) {
      this.logger.error(`❌ Failed to attach socket to JWT ${jwtId}: ${err.message}`);
      throw err;
    }
  }

  // ────────────────────────────────
  // SECTION 5: Private Utilities
  // ────────────────────────────────

  private async safeUpdate(
    sessionId: string,
    status: SessionStatus,
    action: AuditAction,
  ): Promise<UserSession | null> {
    try {
      const session = await this.prisma.userSession.update({
        where: { id: sessionId },
        data: { status },
      });

      await this.userEventService.log({
        userId: session.userId,
        sessionId: session.id,
        action,
      });

      return session;
    } catch (err) {
      this.logger.error(`❌ Failed to update session ${sessionId} to ${status}: ${err.message}`);
      return null;
    }
  }
}
