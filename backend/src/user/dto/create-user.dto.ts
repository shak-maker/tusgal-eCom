export class CreateUserDto {
  email: string;
  password: string;
  name?: string;
  role?: 'ADMIN' | 'CUSTOMER' | 'SELLER';
} 