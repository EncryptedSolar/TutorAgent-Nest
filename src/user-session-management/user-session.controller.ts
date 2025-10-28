import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { Roles } from 'src/common/decoratos/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { UserSessionEntity } from './user-session.entity';
import { Role } from 'src/common/enums/role.enum';

@Controller('user-session')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserSessionController {
  constructor(private readonly userSessionService: UserSessionService) { }

  /**
   * List all user sessions (active, idle, offline, etc.)
   */
  @Get('sessions')
  @Roles(Role.ADMIN)
  async getAllSessions() {
    return this.userSessionService.getAllSessions();
  }

  /**
   * List only active sessions
   */
  @Get('sessions/active')
  @Roles(Role.ADMIN)
  async getActiveSessions() {
    return this.userSessionService.getActiveSessions();
  }

  /**
   * Get details for a specific session
   */
  @Get('sessions/:id')
  @Roles(Role.ADMIN)
  async getSession(@Param('id') id: string) {
    const sessions = await this.userSessionService.getAllSessions();
    return sessions.find((s) => s.id === id);
  }

  /**
   * Get all sessions for a specific user
   */
  @Get('users/:userId/sessions')
  @Roles(Role.ADMIN)
  async getSessionsByUser(@Param('userId') userId: string) {
    return this.userSessionService.getSessionsByUser(userId);
  }

  /**
   * Force terminate a specific session
   */
  @Patch('sessions/:id/terminate')
  @Roles(Role.ADMIN)
  async terminateSession(@Param('id') id: string) {
    await this.userSessionService.terminateSession(id);
    return { message: `Session ${id} terminated.` };
  }
}
