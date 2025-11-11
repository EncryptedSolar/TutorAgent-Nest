import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role, SessionStatus, UserSession } from '@prisma/client';
import { UserEventService } from 'src/audit/user-event.service';

@Injectable()
export class UserSessionService {
  // ────────────────────────────────
  // SECTION 1: Dependencies & Setup
  // ────────────────────────────────
  private readonly logger = new Logger(UserSessionService.name);

  constructor(private readonly prisma: PrismaService, private readonly userEventService: UserEventService) {
    // logic here
  }

  // ────────────────────────────────
  // SECTION 2: Core Session Lifecycle
  // ────────────────────────────────
  // 🟢 Create a new user session record
  // Logs a LOGIN event with metadata
  async createSession(params: {
    userId: string;
    role: Role;
    jwtId: string | null;
    ipAddress?: string;
    deviceInfo?: string;
    channel?: 'REST' | 'SOCKET' | 'OTHER';
  }) {
    const session = await this.prisma.userSession.create({
      data: {
        ...params,
        channel: params.channel ?? 'REST', // 🆕 default REST
        status: SessionStatus.ACTIVE,
        loginAt: new Date(),               // 🆕 explicit login time
        lastActivity: new Date(),
      },
    });

    await this.userEventService.log({
      userId: session.userId,
      sessionId: session.id,
      component: 'UserSessionService',
      action: 'LOGIN',
      metadata: {
        ipAddress: session.ipAddress,
        deviceInfo: session.deviceInfo,
        channel: session.channel,
      },
    });

    this.logger.log(
      `New ${session.channel} session created for user ${params.userId} (${params.role})`
    );

    return session;
  }

  // 🟡 Update last activity timestamp for a given JWT
  // Reactivates idle/offline sessions
  async updateActivity(jwtId: string, socketId?: string): Promise<UserSession | null> {
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

    // ✅ Log user event
    await this.userEventService.log({
      userId: session.userId,
      sessionId: session.id,
      component: 'UserSessionService',
      action: 'UPDATE_ACTIVITY',
      metadata: { socketId },
    });

    return updated;
  }

  // ────────────────────────────────
  // SECTION 3: State Management Helpers
  // ────────────────────────────────
  // 🔵 Mark session as IDLE (inactive but still logged in)
  async markIdle(sessionId: string) {
    const session = await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.IDLE },
    });

    // ✅ Log user event
    await this.userEventService.log({
      userId: session.userId,
      sessionId: session.id,
      component: 'UserSessionService',
      action: 'MARK_IDLE',
    });

    return session;
  }
  
  // 🔴 Mark session as OFFLINE (disconnected or socket lost)
  async markOffline(sessionId: string) {
    const session = await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.OFFLINE },
    });

    // ✅ Log user event
    await this.userEventService.log({
      userId: session.userId,
      sessionId: session.id,
      component: 'UserSessionService',
      action: 'MARK_OFFLINE',
    });

    return session;
  }

  // ⚫ Terminate session and store total duration
  async terminateSession(sessionId: string) {
    console.log(`Terminating session: ${sessionId}`);
    const session = await this.prisma.userSession.findUnique({ where: { id: sessionId } });
    if (!session) return;

    const now = new Date();
    const durationSeconds = Math.floor(
      (now.getTime() - new Date(session.loginAt).getTime()) / 1000
    );

    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.TERMINATED,
        terminatedAt: now,
        duration: durationSeconds, // 🆕 store total session duration
      },
    });

    await this.userEventService.log({
      userId: session.userId,
      sessionId: session.id,
      component: 'UserSessionService',
      action: 'TERMINATE',
      metadata: { durationSeconds },
    });


    this.logger.log(
      `Session ${sessionId} terminated after ${durationSeconds}s`
    );
  }

  /// ────────────────────────────────
  // SECTION 4: Queries / Retrieval
  // ────────────────────────────────
  async getSessionById(sessionId: string) {
    return this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });
  }

  async findByJwtId(jwtId: string) {
    return this.prisma.userSession.findUnique({
      where: { jwtId },
    });
  }

  async getSessionsByUser(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId },
    });
  }

  async getActiveSessions() {
    return this.prisma.userSession.findMany({
      where: { status: SessionStatus.ACTIVE },
    });
  }

  async getAllSessions({ page, limit, search }: { page: number; limit: number; search?: string }) {
    const where = search
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
        skip: (page - 1) * limit, // ✅ number
        take: limit,               // ✅ number
        orderBy: { loginAt: 'desc' },
      }),
      this.prisma.userSession.count({ where }),
    ]);

    return { sessions, total };
  }

  // 🔵 Session Utility Helpers
  async refreshSessionActivity(userId: string, channel: 'REST' | 'SOCKET', socketId?: string) {
    const activeSessions = await this.prisma.userSession.findMany({
      where: { userId, status: { in: [SessionStatus.ACTIVE, SessionStatus.IDLE, SessionStatus.OFFLINE] } },
      orderBy: { updatedAt: 'desc' },
    });

    // Prioritize socket-based or most recent sessions
    const target = activeSessions.find(s => s.channel === channel) || activeSessions[0];
    if (!target) return null;

    return this.updateActivity(target.jwtId!, socketId);
  }

  async attachSocket(jwtId: string, socketId: string) {
    const sessions = await this.prisma.userSession.updateMany({
      where: { jwtId },
      data: { socketId },
    });

    // Get one session to log event
    const session = await this.prisma.userSession.findUnique({ where: { jwtId } });
    if (session) {
      await this.userEventService.log({
        userId: session.userId,
        sessionId: session.id,
        component: 'UserSessionService',
        action: 'ATTACH_SOCKET',
        metadata: { socketId },
      });
    }

    return sessions;
  }

}
