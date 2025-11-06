// user‑session/user‑session.resolver.ts
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UserSessionDTO } from './user-session.dto';
import { UserSessionService } from './user-session.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decoratos/roles.decorator';
import { Role } from '@prisma/client';

@Resolver(() => UserSessionDTO)
@UseGuards(JwtAuthGuard, RolesGuard)   // optional at class-level
export class UserSessionResolver {
    constructor(private readonly userSessionService: UserSessionService) { }

    @Query(() => [UserSessionDTO], { name: 'allSessions' })
    @Roles(Role.ADMIN)  // only admins can call this
    async getAllSessions(
        @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
        @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
        @Args('search', { type: () => String, nullable: true }) search?: string,
    ): Promise<UserSessionDTO[]> {
        const result = await this.userSessionService.getAllSessions({ page, limit, search });

        // Map Prisma result to DTO type (convert null → undefined)
        return result.sessions.map(session => ({
            ...session,
            jwtId: session.jwtId ?? undefined,
            ipAddress: session.ipAddress ?? undefined,
            deviceInfo: session.deviceInfo ?? undefined,
            socketId: session.socketId ?? undefined,
            channel: session.channel ?? undefined,
            terminatedAt: session.terminatedAt ?? undefined,  // ✅ convert null -> undefined
            duration: session.duration ?? undefined,          // optional
        }));

    }

}
