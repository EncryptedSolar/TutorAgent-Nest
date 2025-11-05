import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/user/user.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { JwtUtilsService } from 'src/common/utils/jwt-utils.service';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { UserSessionService } from 'src/user-session-management/user-session.service';
import { JwtPayload, PrismaSafeUser, RequestWithBody, RequestWithUser, SafeUser, TokenPair, TokensForUser } from 'src/common/types/auth.type';
import { CreateSessionDto } from 'src/dto/create-session.dto';
import { Request } from 'express';


@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtUtils: JwtUtilsService,
    private readonly configService: ConfigService,
    private readonly userSessionService: UserSessionService,
  ) {
    const clientId = this.configService.get<string>('google.googleClientId');
    if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not set');
    this.googleClientId = clientId;
    this.googleClient = new OAuth2Client(this.googleClientId);
  }

  // Register and auto-login
  async register(req: RequestWithBody<CreateUserDto>): Promise<TokenPair> {
    const dto = req.body;
    const user = await this.usersService.createUser(dto);

    const { access_token, refresh_token, safeUser, jti } =
      await this.issueTokensForUser(user);

    await this.userSessionService.createSession({
      userId: user.id,
      role: user.role,
      jwtId: jti,
      ipAddress: req.ip ?? undefined,
      deviceInfo: req.headers['user-agent'] ?? undefined,
    } as CreateSessionDto);

    return { access_token, refresh_token, user: safeUser };
  }

  // Login
  async login(req: RequestWithUser): Promise<TokenPair> {
    const user = req.user;

    const { access_token, refresh_token, safeUser, jti } =
      await this.issueTokensForUser(user);

    await this.userSessionService.createSession({
      userId: user.id,
      role: user.role,
      jwtId: jti,
      ipAddress: req.ip ?? undefined,
      deviceInfo: req.headers['user-agent'] ?? undefined,
    } as CreateSessionDto);

    return { access_token, refresh_token, user: safeUser };
  }

  // Google login
  async googleLogin(token: string, req: Request): Promise<TokenPair> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: this.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) throw new UnauthorizedException('Invalid Google token');

    let user: PrismaSafeUser | null = await this.usersService.findByEmail(payload.email);
    if (!user) {
      user = await this.usersService.createGoogleUser({
        email: payload.email,
        name: payload.name ?? 'Unnamed User',
        role: 'USER',
      });
    }

    const { access_token, refresh_token, safeUser, jti } =
      await this.issueTokensForUser(user);

    await this.userSessionService.createSession({
      userId: user.id,
      role: user.role,
      jwtId: jti,
      ipAddress: req.ip ?? undefined,
      deviceInfo: req.headers['user-agent'] ?? undefined,
    } as CreateSessionDto);

    // Override picture from Google payload
    safeUser.picture = payload.picture ?? safeUser.picture ?? null;

    return { access_token, refresh_token, user: safeUser };
  }

  // Issue tokens — strongly typed
  private async issueTokensForUser(user: PrismaSafeUser): Promise<TokensForUser> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const { accessToken, refreshToken, jti } = await this.jwtUtils.generateTokens(payload);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(user.id, { refreshTokenHash });

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      username: user.username ?? undefined,
      picture: user.picture ?? null,
    };

    return { access_token: accessToken, refresh_token: refreshToken, safeUser, jti };
  }

  // Refresh tokens
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const payload = (await this.jwtUtils.verifyRefreshToken(refreshToken)) as JwtPayload;
    const user = await this.usersService.findById(payload.sub);
    if (!user?.refreshTokenHash) throw new ForbiddenException('Refresh token not found');

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) throw new ForbiddenException('Invalid refresh token');

    const { access_token, refresh_token } = await this.issueTokensForUser(user);
    return { access_token, refresh_token };
  }

  // Logout
  async logout(userId: string, jti: string): Promise<{ message: string }> {
    console.log(`Logging out user: ${userId} and it's jti ${jti}`);
    await this.usersService.clearRefreshToken(userId);
    this.userSessionService.findByJwtId(jti).then(session => {
      if (session) this.userSessionService.terminateSession(session.id);
    }).catch((err) => {
      console.error(`Error terminating session for JWT ID ${jti}:`, err);
    })
    return { message: 'Logged out successfully' };
  }
}

