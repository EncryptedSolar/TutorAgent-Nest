import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CreateUserDto } from 'src/dto/create-user.dto';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  /**
   * User login
   * Uses LocalStrategy to validate email/password.
   * Returns an access token and refresh token.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  /**
    * User login with Google OAuth
    * Accepts a Google ID token.
    * Returns an access token and refresh token.
    */
  @Post('google')
  async googleLogin(@Body('token') token: string) {
    return this.authService.googleLogin(token);
  }

  /**
   * Refresh access token
   * Accepts a refresh token and returns a new access/refresh token pair.
   */
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
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
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }
}
