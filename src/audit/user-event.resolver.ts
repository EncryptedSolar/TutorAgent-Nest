import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decoratos/roles.decorator';
import { Role } from '@prisma/client';
import { UserEventService } from 'src/audit/user-event.service';
import { UserEventDTO } from './user-event.dto';

@Resolver(() => UserEventDTO)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserEventResolver {
    constructor(private readonly userEventService: UserEventService) { }

    @Query(() => [UserEventDTO], { name: 'userEvents' })
    async getUserEvents(
        @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
        @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
        @Args('userId', { type: () => String, nullable: true }) userId?: string,
        @Args('action', { type: () => String, nullable: true }) action?: string,
        @Args('component', { type: () => String, nullable: true }) component?: string,
    ) {
        const result = await this.userEventService.findAll({ page, limit, userId, action, component });
        return result.events; // or return result directly if you want pagination
    }
}
