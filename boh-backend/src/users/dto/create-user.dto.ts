import { IsEmail, IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsIn(['master', 'user'])
  role?: 'master' | 'user';
} 