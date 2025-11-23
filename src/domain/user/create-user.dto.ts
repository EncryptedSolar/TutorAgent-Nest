import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength, IsString } from 'class-validator';
import { Role } from 'generated/prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either USER or ADMIN' })
  role?: Role;

  // Optional fields for metadata
  @IsOptional()
  @IsString({ message: 'Region must be a string' })
  region?: string;

}
