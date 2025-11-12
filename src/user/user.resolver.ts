import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decoratos/roles.decorator';
import { Role } from '@prisma/client';
import { UsersService } from 'src/user/user.service';
import { UserDTO } from './user.dto';

@Resolver(() => UserDTO)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserResolver {
  constructor(private readonly usersService: UsersService) { }

  @Query(() => [UserDTO], { name: 'allUsers' })
  async getAllUsers(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    const { users } = await this.usersService.findAll({ page, limit, search });
    return users; // return the array
  }

  @Query(() => UserDTO, { name: 'userById', nullable: true })
  async getUserById(@Args('id', { type: () => String }) id: string) {
    return this.usersService.findById(id);
  }
}
