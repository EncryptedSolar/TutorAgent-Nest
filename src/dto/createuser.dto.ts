export class CreateUserDto {
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}