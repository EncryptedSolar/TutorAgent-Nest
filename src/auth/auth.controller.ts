import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {
  }

  @Post('register')
  async register(@Request() req) {
    return this.authService.register(req);
  }
  /**
   * User login
   * Uses LocalStrategy to validate email/password.
   * Returns an access token and refresh token.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req); // ✅ pass the whole request
  }

  /**
    * User login with Google OAuth
    * Accepts a Google ID token.
    * Returns an access token and refresh token.
    */
  @Post('google')
  async googleLogin(@Req() req, @Body('token') token: string) {
    return this.authService.googleLogin(token, req);
  }

  /**
   * Refresh access token
   * Accepts a refresh token and returns a new access/refresh token pair.
   */
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    console.log(`Refreshing token: ${refreshToken}`);
    return this.authService.refreshTokens(refreshToken);
  }

  /**
   * Logout user
   * Invalidates the stored refresh token so it can’t be reused.
   * Requires a valid access token to identify the user.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    await this.authService.logout(req.user.userId, req.user.jti);
    return { message: 'Logged out successfully' };
  }
}
