import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import { User } from './user.entity';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { GoogleUserDto } from 'src/dto/google-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  // ✅ Create new user with unique GitHub-style username
  async createUser(dto: CreateUserDto) {
    const existingEmail = await this.usersRepository.findOne({ where: { email: dto.email } });
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
    } while (await this.usersRepository.findOne({ where: { username } }));

    const user = this.usersRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: dto.role ?? 'USER',
      username,
    });

    await this.usersRepository.save(user);
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async createGoogleUser(dto: GoogleUserDto) {
    const existingEmail = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existingEmail) return existingEmail;

    // Generate GitHub-style unique username
    let baseSlug = slugify(dto.name || dto.email.split('@')[0], { lower: true, strict: true });
    let username: string;
    do {
      username = `${baseSlug}-${nanoid(4)}`;
    } while (await this.usersRepository.findOne({ where: { username } }));

    const user = this.usersRepository.create({
      email: dto.email,
      name: dto.name,
      password: '', // 👈 stored empty for Google users
      role: dto.role || 'USER',
      username,
      isGoogleUser: true,
    });

    await this.usersRepository.save(user);
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // ✅ Validate user credentials safely
  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    console.log('🧩 validateUser called for:', email);
    console.log('🔍 Found user:', user);

    if (!user) return null;
    if (!user.password) {
      console.warn('⚠️ User has no password hash stored');
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    // ✅ Return full user entity — don't strip password yet
    return user;
  }




  // ✅ Find user by email (includes password for auth)
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // ✅ Find user by ID (safe return without password)
  async findById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  }

  // ✅ Update user (supports refreshTokenHash and other fields)
  async update(userId: string, partial: Partial<User>): Promise<void> {
    await this.usersRepository.update({ id: userId }, partial);
  }

  // Optional helper to clear refresh token
  async clearRefreshToken(userId: string | number): Promise<void> {
    await this.usersRepository.update(userId, { refreshTokenHash: null });
  }
}
