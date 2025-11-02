import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { Roles } from 'src/common/decoratos/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
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
  async getAllSessions(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string
  ) {
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 20;

    return this.userSessionService.getAllSessions({
      page: pageNumber,
      limit: limitNumber,
      search,
    });
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
    const session = await this.userSessionService.getSessionById(id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return session;
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
