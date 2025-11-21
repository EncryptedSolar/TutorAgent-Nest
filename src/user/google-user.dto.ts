import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';
import { Role } from 'generated/prisma/client';

export class GoogleUserDto {
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either USER or ADMIN' })
  role?: Role;

  // Optional metadata
  @IsOptional()
  @IsString({ message: 'Region must be a string' })
  region?: string;

}
