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
import { UserSessionService } from 'src/user-session-management/user-session.service';

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
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not set in configuration');
    }

    this.googleClientId = clientId;
    this.googleClient = new OAuth2Client(this.googleClientId);
  }

  // ✅ Register new user and auto-login
  async register(req: any) {
    const dto = req.body; // ⬅️ use req.body, not req.user

    // 1️⃣ Create new user
    const user = await this.usersService.createUser(dto);

    // 2️⃣ Issue access + refresh tokens
    const tokens = await this.issueTokensForUser(user);

    // 3️⃣ Create session entry
    const session = await this.userSessionService.createSession({
      userId: user.id,
      role: user.role,
      jwtId: null, // temporarily null, will update after decoding
      ipAddress: req.ip || null,
      deviceInfo: req.headers['user-agent'] || null,
    });

    // 4️⃣ Decode JWT to extract jti (if your JWT includes it)
    const decoded = this.jwtUtils.decode(tokens.access_token);
    if (decoded?.jti) {
      await this.userSessionService.updateActivity(decoded.jti);
    } else {
      // fallback: associate session manually with user
      await this.userSessionService.updateActivity(session.id);
    }
    return tokens;
  }

  // ✅ Login
  async login(req: any) {
    const user = req.user; // extracted by LocalAuthGuard

    // Create user session BEFORE issuing tokens
    await this.userSessionService.createSession({
      userId: user.id,
      role: user.role,
      jwtId: null, // We'll set it after generating tokens
      ipAddress: req.ip || null,
      deviceInfo: req.headers['user-agent'] || null,
    });

    // Issue tokens (unchanged)
    const tokens = await this.issueTokensForUser(user);

    // Now that access token is generated, update session with JWT ID
    // If you want, you could use `access_token` as session identifier
    const decoded = this.jwtUtils.decode(tokens.access_token); // make sure decode returns { jti, ... }
    await this.userSessionService.updateActivity(decoded.jti);

    return tokens;
  }

  // ✅ Google login
  async googleLogin(token: string, req: any) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload?.email) throw new UnauthorizedException('Invalid Google token');

      // 1️⃣ Find or create user
      let user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        user = await this.usersService.createGoogleUser({
          email: payload.email,
          name: payload.name || 'Unnamed User',
          role: 'USER',
        });
      }

      // 2️⃣ Issue JWTs
      const jwtPayload = { sub: user.id, email: user.email, role: user.role };
      const { accessToken, refreshToken } = await this.jwtUtils.generateTokens(jwtPayload);

      // 3️⃣ Store refresh token hash
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      await this.usersService.update(user.id, { refreshTokenHash });

      // 4️⃣ Decode JWT to extract jti (if available)
      const decoded = this.jwtUtils.decode(accessToken);

      // 5️⃣ Create user session for admin analytics
      await this.userSessionService.createSession({
        userId: user.id,
        role: user.role,
        jwtId: decoded?.jti ?? null,
        ipAddress: req.ip || null,
        deviceInfo: req.headers['user-agent'] || null,
      });

      // 6️⃣ Build response object
      const safeUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        username: user.username,
        picture: payload.picture || null,
      };

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
    const { accessToken, refreshToken } = await this.jwtUtils.generateTokens(payload);
    console.log('🪙 Tokens generated:', { accessToken, refreshToken });
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
