import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/user/user.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { JwtUtilsService } from 'src/common/utils/jwt-utils.service';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtUtils: JwtUtilsService,
    private readonly configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('google.googleClientId');
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not set in configuration');
    }

    this.googleClientId = clientId;
    this.googleClient = new OAuth2Client(this.googleClientId);
  }

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

  // ✅ Google login
  async googleLogin(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload?.email) throw new UnauthorizedException('Invalid Google token');

      // Try to find existing user
      let user = await this.usersService.findByEmail(payload.email);

      // If user doesn’t exist, create them
      if (!user) {
        const newUserDto = {
          email: payload.email,
          name: payload.name || 'Unnamed User',
          password: '', // not used for Google users
          role: 'USER' as const,
        };

        user = await this.usersService.createGoogleUser(newUserDto);
      }

      // Include Google picture in the safeUser object sent to frontend
      const safeUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        username: user.username,
        picture: payload.picture || null, // ✅ send picture from Google token
      };

      // Issue app JWTs (without storing picture in DB)
      const payloadJwt = { sub: user.id, email: user.email, role: user.role };
      const { accessToken, refreshToken } = await this.jwtUtils.generateTokens(payloadJwt);

      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      await this.usersService.update(user.id, { refreshTokenHash });

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: safeUser,
      };
    } catch (err) {
      console.error('Google login failed:', err);
      throw new UnauthorizedException('Google authentication failed');
    }
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
      picture: user.picture || null,
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
