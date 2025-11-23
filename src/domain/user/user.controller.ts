import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express'
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

@Controller('users')
export class UsersController {

  constructor() { }

  @UseGuards(JwtAuthGuard)
  @Post('hello')
  async sayHello(@Body() something: any, @Req() req: Request & { user: { userId: string; email: string; role: string } }) {
    return { message: `Hey ${req.user.email}, I received your message.` };
  }
}
