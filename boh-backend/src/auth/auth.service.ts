import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<{ token: string; user: any }> {
    const user = await this.usersService.validateUser(username, password);
    if (!user) throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    const payload = { sub: user.id, role: user.role };
    const token = await this.jwtService.signAsync(payload);
    const { password: pw, ...userInfo } = user;
    return { token, user: userInfo };
  }
}
