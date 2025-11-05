import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { GoogleUserDto } from 'src/dto/google-user.dto';
import { User } from '@prisma/client';
import { PrismaSafeUser } from 'src/common/types/auth.type';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  // ✅ Create new user with unique GitHub-style username
  async createUser(dto: CreateUserDto): Promise<PrismaSafeUser> {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Generate base slug from name or email prefix
    let baseSlug = slugify(dto.name, { lower: true, strict: true });
    if (!baseSlug) {
      baseSlug = slugify(dto.email.split('@')[0], { lower: true, strict: true });
    }

    // GitHub-style unique username e.g. john-smith-7g3p
    let username: string;
    do {
      username = `${baseSlug}-${nanoid(4)}`;
    } while (await this.prisma.user.findUnique({ where: { username } }));

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        role: dto.role ?? 'USER',
        username,
      },
    });

    // Strip password before returning
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async createGoogleUser(dto: GoogleUserDto): Promise<PrismaSafeUser> {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) return existingEmail;

    // Generate GitHub-style unique username
    let baseSlug = slugify(dto.name || dto.email.split('@')[0], { lower: true, strict: true });
    let username: string;
    do {
      username = `${baseSlug}-${nanoid(4)}`;
    } while (await this.prisma.user.findUnique({ where: { username } }));

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: '', // stored empty for Google users
        role: dto.role || 'USER',
        username,
        isGoogleUser: true,
      },
    });

    const { password, ...safeUser } = user;
    return safeUser;
  }

  // ✅ Validate user credentials safely
  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    console.log('🧩 validateUser called for:', email);
    console.log('🔍 Found user:', user?.name);

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
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        username: true,
        picture: true,
        refreshTokenHash: true,
        isGoogleUser: true,
      },
    });
  }

  // ✅ Find user by ID (safe return without password)
  async findById(id: string): Promise<PrismaSafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
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
}
