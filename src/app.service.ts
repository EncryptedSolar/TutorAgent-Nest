import { Injectable } from '@nestjs/common';
import { UsersService } from './user/user.service';
import { CreateUserDto } from './user/create-user.dto';

@Injectable()
export class AppService {
  constructor(private readonly usersService: UsersService) { }

  async onModuleInit() {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    const existingAdmin = await this.usersService.findByEmail(adminEmail);
    if (!existingAdmin) {
      console.log('[INIT] No admin found. Creating default admin...');
      let adminAcc: CreateUserDto = {
        email: process.env.ADMIN_EMAIL as unknown as string,
        password: process.env.ADMIN_PASSWORD as unknown as string,
        name: process.env.ADMIN_NAME || 'System Admin',
        role: 'ADMIN',
      }
      console.log(adminAcc)
      await this.usersService.createUser(adminAcc);
      console.log('[INIT] Default admin account created.');
    } else {
      console.log('[INIT] Admin already exists.');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
