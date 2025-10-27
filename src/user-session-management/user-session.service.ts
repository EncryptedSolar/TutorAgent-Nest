import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionStatus, UserSessionEntity } from './user-session.entity';

@Injectable()
export class UserSessionService {
  private readonly logger = new Logger(UserSessionService.name);

  constructor(
    @InjectRepository(UserSessionEntity)
    private readonly sessionRepo: Repository<UserSessionEntity>,
  ) {}

  /**
   * Create a new session when a user logs in
   */
  async createSession(params: {
    userId: string;
    role: string;
    jwtId: null | string;
    ipAddress?: string;
    deviceInfo?: string;
  }): Promise<UserSessionEntity> {
    const session = this.sessionRepo.create({
      ...params,
      status: SessionStatus.ACTIVE,
      lastActivity: new Date(),
    });

    const saved = await this.sessionRepo.save(session);
    this.logger.log(
      `New session created for user ${params.userId} (${params.role})`,
    );
    return saved;
  }

  /**
   * Update activity — called whenever the user does something
   */
  async updateActivity(
    jwtId: string,
    socketId?: string,
  ): Promise<UserSessionEntity | null> {
    const session = await this.sessionRepo.findOne({ where: { jwtId } });
    if (!session) return null;

    session.lastActivity = new Date();
    session.status = SessionStatus.ACTIVE;
    if (socketId) session.socketId = socketId;

    await this.sessionRepo.save(session);
    return session;
  }

  /**
   * Mark session as idle (for scheduler)
   */
  async markIdle(sessionId: string): Promise<void> {
    await this.sessionRepo.update(sessionId, { status: SessionStatus.IDLE });
  }

  /**
   * Mark session as offline (for scheduler)
   */
  async markOffline(sessionId: string): Promise<void> {
    await this.sessionRepo.update(sessionId, { status: SessionStatus.OFFLINE });
  }

  /**
   * Explicitly terminate a session (logout or forced)
   */
  async terminateSession(sessionId: string): Promise<void> {
    await this.sessionRepo.update(sessionId, {
      status: SessionStatus.TERMINATED,
      terminatedAt: new Date(),
    });
  }

  /**
   * Find session by JWT ID
   */
  async findByJwtId(jwtId: string): Promise<UserSessionEntity | null> {
    return this.sessionRepo.findOne({ where: { jwtId } });
  }

  /**
   * Get all sessions for a user
   */
  async getSessionsByUser(userId: string): Promise<UserSessionEntity[]> {
    return this.sessionRepo.find({ where: { userId } });
  }

  /**
   * Get all currently active sessions
   */
  async getActiveSessions(): Promise<UserSessionEntity[]> {
    return this.sessionRepo.find({ where: { status: SessionStatus.ACTIVE } });
  }

  /**
   * For debugging or admin analytics
   */
  async getAllSessions(): Promise<UserSessionEntity[]> {
    return this.sessionRepo.find();
  }
}
