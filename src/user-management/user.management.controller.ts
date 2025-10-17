import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { UserManagementService } from './user.management.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decoratos/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('user-management')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserManagementController {
  constructor(private readonly userMgmtService: UserManagementService) {}

  @Get('active')
  async getActiveUsers() {
    const users = await this.userMgmtService.getActiveUsers();
    return { activeUsers: users };
  }

  @Get('sessions/:userId')
  async getUserSessions(@Param('userId') userId: string) {
    const sessions = await this.userMgmtService.getUserSessions(userId);
    return { userId, sessions };
  }
}
