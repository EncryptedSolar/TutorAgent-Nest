import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/dto/createuser.dto';
import { UsersService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  // ✅ Validate username/password
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    // Strip password before returning
    const { password: _pass, ...result } = user;
    return result;
  }

  // ✅ New register method
  async register(dto: CreateUserDto) {
    // 1️⃣ Create the user
    const user = await this.usersService.createUser(dto);

    // 2️⃣ Immediately generate tokens
    return this.login(user);
  }

  // ✅ Generate access + refresh tokens and persist hashed refresh token
  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES, // adjust as needed
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES, // adjust as needed
    });

    // Store hashed refresh token in DB for revocation/rotation
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(user.id, { refreshTokenHash: hash });

    // Exclude sensitive fields before returning
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
    try {
      // Verify signature & expiration
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshTokenHash) throw new ForbiddenException('Refresh token not found');

      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) throw new ForbiddenException('Invalid refresh token');

      // Generate new tokens
      const newPayload = { sub: user.id, email: user.email, role: user.role };

      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES,
      });

      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES,
      });

      // Rotate refresh token
      const newHash = await bcrypt.hash(newRefreshToken, 10);
      await this.usersService.update(user.id, { refreshTokenHash: newHash });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ✅ Logout (invalidate refresh token)
  async logout(userId: string) {
    await this.usersService.update(userId, { refreshTokenHash: null });
    return { message: 'Logged out' };
  }
}
