import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from 'src/dto/createuser.dto';

@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }
}
