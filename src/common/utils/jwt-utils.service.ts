// src/common/utils/jwt-utils.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtUtilsService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpires: string;
  private readonly refreshExpires: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const jwt = this.configService.get('jwt');
    this.accessSecret = jwt.accessSecret;
    this.refreshSecret = jwt.refreshSecret;
    this.accessExpires = jwt.accessExpires;
    this.refreshExpires = jwt.refreshExpires;
  }

  async generateTokens(payload: Record<string, any>) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: this.accessExpires,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpires,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async verifyAccessToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.accessSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  decode(token: string) {
    return this.jwtService.decode(token);
  }
}
