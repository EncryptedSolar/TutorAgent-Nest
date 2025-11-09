import { Role } from '@prisma/client';
import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(Role, { message: 'Role must be either USER or ADMIN' })
  role: Role = Role.USER;

  @IsOptional()
  @IsString()
  jwtId: string | null;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  deviceInfo?: string;
}
