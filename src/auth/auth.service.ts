// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/user/user.service';
import { CreateUserDto } from 'src/dto/createuser.dto';
import { JwtUtilsService } from 'src/common/utils/jwt-utils.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtUtils: JwtUtilsService,
  ) {}

  // ✅ Validate user credentials
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  // ✅ Register new user and auto-login
  async register(dto: CreateUserDto) {
    const user = await this.usersService.createUser(dto);
    return this.issueTokensForUser(user);
  }

  // ✅ Login
  async login(user: any) {
    return this.issueTokensForUser(user);
  }

  // ✅ Issue new access & refresh tokens
  private async issueTokensForUser(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken } =
      await this.jwtUtils.generateTokens(payload);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(user.id, { refreshTokenHash });

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      username: user.username,
    };

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: safeUser,
    };
  }

  // ✅ Refresh tokens (verify + rotate)
  async refreshTokens(refreshToken: string) {
    const payload = await this.jwtUtils.verifyRefreshToken(refreshToken);

    const user = await this.usersService.findById(payload.sub);
    if (!user?.refreshTokenHash)
      throw new ForbiddenException('Refresh token not found');

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) throw new ForbiddenException('Invalid refresh token');

    const newPayload = { sub: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken: newRefreshToken } =
      await this.jwtUtils.generateTokens(newPayload);

    const newHash = await bcrypt.hash(newRefreshToken, 10);
    await this.usersService.update(user.id, { refreshTokenHash: newHash });

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  // ✅ Logout (invalidate refresh token)
  async logout(userId: string) {
    await this.usersService.update(userId, { refreshTokenHash: null });
    return { message: 'Logged out successfully' };
  }
}
