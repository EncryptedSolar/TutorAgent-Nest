import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PrismaSafeUser } from 'src/common/types/auth.type';
import { RequestWithMetadata } from 'src/common/types/user.interface';
import { v4 as uuidv4 } from 'uuid'
import { SessionStatus, User } from 'generated/prisma/client';
import { UserEventService } from '../audit/user-event.service';
import { CreateUserDto } from './create-user.dto';
import { GoogleUserDto } from './google-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly userEventService: UserEventService) { }

  async createUser(dto: CreateUserDto, req?: RequestWithMetadata): Promise<PrismaSafeUser> {
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingEmail) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // ✅ Create new user with unique GitHub-style username
    let baseSlug = slugify(dto.name, { lower: true, strict: true });
    if (!baseSlug) baseSlug = slugify(dto.email.split('@')[0], { lower: true, strict: true });

    // Keeps generatin new username if same username found
    let username: string;
    do {
      username = `${baseSlug}-${nanoid(4)}`;
    } while (await this.prisma.user.findUnique({ where: { username } }));

    const ipAddress = req?.ip ?? req?.headers['x-forwarded-for'] ?? req?.connection?.remoteAddress ?? null;
    const deviceInfo = (req?.deviceInfo || req?.headers['user-agent']) ?? null;
    const region = dto.region ?? req?.region ?? null;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        role: dto.role ?? 'USER',
        username,
        region,
      },
    });

    this.userEventService.createUserEvent({
      id: uuidv4(),
      userId: user.id,
      sessionId: null,
      action: 'REGISTER',
      metadata: { ipAddress, deviceInfo },
      createdAt: new Date()
    })

    const { password, refreshTokenHash, ...safeUser } = user;
    return safeUser;
  }

  async createGoogleUser(dto: GoogleUserDto, req?: RequestWithMetadata): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) return existingUser;

    let baseSlug = slugify(dto.name || dto.email.split('@')[0], { lower: true, strict: true });
    let username: string;
    do {
      username = `${baseSlug}-${nanoid(4)}`;
    } while (await this.prisma.user.findUnique({ where: { username } }));

    const ipAddress = req?.ip ?? req?.headers['x-forwarded-for'] ?? req?.connection?.remoteAddress ?? null;
    const deviceInfo = (req?.deviceInfo || req?.headers['user-agent']) ?? null;
    const region = dto.region ?? req?.region ?? null;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: null,
        role: dto.role || 'USER',
        username,
        isGoogleUser: true,
        region,
      },
    });

    // Optional: initial UserEvent
    await this.userEventService.createUserEvent({
      id: uuidv4(),
      userId: user.id,
      sessionId: null,
      action: 'GOOGLE_REGISTER',
      metadata: { ipAddress, deviceInfo },
      createdAt: new Date()
    });

    return user;
  }




  // ✅ Validate user credentials safely
  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    // console.log('🧩 validateUser called for:', email);
    // console.log('🔍 Found user:', user?.name);

    if (!user) return null;
    if (!user.password) {
      console.warn('⚠️ User has no password hash stored');
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user; // Return full user entity
  }

  // ✅ Find user by email (includes password for auth)
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // For google logins
  async findSafeByEmail(email: string): Promise<PrismaSafeUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // ✅ Find user by ID (safe return without password)
  async findById(id: string): Promise<PrismaSafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { password, refreshTokenHash, ...rest } = user;
    return rest;
  }

  // Fetch full user including password and refreshTokenHash
  async findByIdFull(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // ✅ Update user (supports refreshTokenHash and other fields)
  async update(userId: string, partial: Partial<User>): Promise<void> {
    if (!userId) {
      throw new BadRequestException('Cannot update user: userId is undefined');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: partial,
    });
  }

  // ✅ Clear refresh token safely
  async clearRefreshToken(userId: string): Promise<void> {
    if (!userId) {
      throw new BadRequestException('Cannot clear refresh token: userId is undefined');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async cleanupExpiredSessions(ttlHours = 72) {
    const cutoff = new Date(Date.now() - ttlHours * 3600 * 1000);
    const expired = await this.prisma.userSession.updateMany({
      where: { lastActivity: { lt: cutoff }, status: { not: 'TERMINATED' } },
      data: { status: 'TERMINATED', terminatedAt: new Date() },
    });
    console.log(`Cleaned up ${expired.count} old sessions`);
  }

  async countActiveSessions(userId: string) {
    return this.prisma.userSession.count({
      where: { userId, status: SessionStatus.ACTIVE },
    });
  }

  async validateSession(jwtId: string, userId: string) {
    const session = await this.prisma.userSession.findUnique({ where: { jwtId } });
    if (!session || session.userId !== userId) return null;
    return session;
  }

  async findAll(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;

    const where = search
      ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ],
      }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

}
