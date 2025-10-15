import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsEnum(['USER', 'ADMIN'], { message: 'Role must be either USER or ADMIN' })
  role?: 'USER' | 'ADMIN';
}
