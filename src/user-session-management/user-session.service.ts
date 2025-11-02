import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionStatus, UserSession } from '@prisma/client';

@Injectable()
export class UserSessionService {
  private readonly logger = new Logger(UserSessionService.name);

  constructor(private readonly prisma: PrismaService) { }

  async createSession(params: {
    userId: string;
    role: string;
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

    this.logger.log(
      `New ${session.channel} session created for user ${params.userId} (${params.role})`
    );

    return session;
  }

  async getSessionById(sessionId: string) {
    return this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });
  }



  async updateActivity(jwtId: string, socketId?: string): Promise<UserSession | null> {
    const session = await this.prisma.userSession.findUnique({ where: { jwtId } });
    if (!session) return null;

    // Refresh activity timestamp
    return this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        lastActivity: new Date(),
        status: SessionStatus.ACTIVE, // force re-activate if idle/offline
        socketId: socketId ?? session.socketId,
        updatedAt: new Date(),
      },
    });
  }


  async attachSocket(jwtId: string, socketId: string) {
    return this.prisma.userSession.updateMany({
      where: { jwtId },
      data: { socketId },
    });
  }



  async markIdle(sessionId: string) {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.IDLE },
    });
  }

  async markOffline(sessionId: string) {
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.OFFLINE },
    });
  }

  async terminateSession(sessionId: string) {
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

    this.logger.log(
      `Session ${sessionId} terminated after ${durationSeconds}s`
    );
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

}
