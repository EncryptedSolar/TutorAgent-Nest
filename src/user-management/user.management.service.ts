import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from './user-session.entity';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,
  ) {}

  async createSession(userId: string, ip?: string, agent?: string, metadata?: Record<string, any>) {
    const session = this.sessionRepo.create({
      userId,
      ipAddress: ip,
      userAgent: agent,
      isActive: true,
      metadata: metadata || {},
    });

    return await this.sessionRepo.save(session);
  }

  async endSession(sessionId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) return null;

    session.isActive = false;
    session.disconnectedAt = new Date();
    return this.sessionRepo.save(session);
  }

  async markUserInactive(userId: string) {
    await this.sessionRepo.update(
      { userId, isActive: true },
      { isActive: false, disconnectedAt: new Date() },
    );
  }

  async getActiveUsers() {
    const sessions = await this.sessionRepo.find({ where: { isActive: true } });
    const uniqueUserIds = [...new Set(sessions.map(s => s.userId))];
    return uniqueUserIds;
  }

  async getUserSessions(userId: string) {
    return this.sessionRepo.find({
      where: { userId },
      order: { connectedAt: 'DESC' },
    });
  }

  async trackTokenUsage(userId: string, tokensUsed: number) {
    // You can later extend this with analytics or usage logs
    const activeSessions = await this.sessionRepo.find({
      where: { userId, isActive: true },
    });

    for (const session of activeSessions) {
      session.metadata = {
        ...(session.metadata || {}),
        tokensUsed: ((session.metadata?.tokensUsed as number) || 0) + tokensUsed,
      };
      await this.sessionRepo.save(session);
    }
  }
}
