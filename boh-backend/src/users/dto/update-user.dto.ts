import { IsEmail, IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['master', 'user'])
  role?: 'master' | 'user';

  @IsOptional()
  isActive?: boolean;
} 