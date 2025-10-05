import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from 'src/dto/createuser.dto';
import { Request } from 'express'
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }


  @UseGuards(JwtAuthGuard)
  @Post('hello')
  async sayHello(@Body() something: any, @Req() req: Request & { user: { userId: string; email: string; role: string } }) {
    console.log('User info:', req.user); // payload from access token
    return `Hey ${req.user.email}, I received your message.`;
  }
}
