import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from 'src/dto/createuser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      email: dto.email,
      password: hashedPassword,
      role: dto.role || 'USER',
    });
    await this.usersRepository.save(user);
    return { ...user, password: undefined }; // hide password
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map(u => ({ ...u, password: undefined }));
  }
}
