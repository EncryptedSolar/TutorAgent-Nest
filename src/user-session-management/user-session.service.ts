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
  }) {
    const session = await this.prisma.userSession.create({
      data: {
        ...params,
        status: SessionStatus.ACTIVE,
        lastActivity: new Date(),
      },
    });

    this.logger.log(`New session created for user ${params.userId} (${params.role})`);
    return session;
  }
  
  async updateActivity(jwtId: string, socketId?: string): Promise<UserSession | null> {
    const session = await this.prisma.userSession.findUnique({ where: { jwtId } });
    if (!session) return null;

    return this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        lastActivity: new Date(),
        status: SessionStatus.ACTIVE,
        socketId: socketId !== undefined ? socketId : session.socketId,
      },
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
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.TERMINATED,
        terminatedAt: new Date(),
      },
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

  async getAllSessions() {
    return this.prisma.userSession.findMany();
  }
}
