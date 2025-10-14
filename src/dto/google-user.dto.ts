import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role?: 'USER' | 'ADMIN';
}
