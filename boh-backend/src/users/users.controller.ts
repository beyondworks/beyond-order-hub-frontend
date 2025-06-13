import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 회원가입 (모든 사용자 가능)
  @Post('register')
  @Public()
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 현재 사용자 정보 조회 (로그인한 사용자 본인)
  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.findOne(req.user.sub);
  }

  // 사용자 전체 조회 (master만)
  @Get()
  @Roles('master')
  async findAll() {
    return this.usersService.findAll();
  }

  // 사용자 단일 조회 (master만)
  @Get(':id')
  @Roles('master')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // 사용자 정보 수정 (master만)
  @Put(':id')
  @Roles('master')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // 사용자 활성/비활성 토글 (master만)
  @Patch(':id/toggle-active')
  @Roles('master')
  async toggleActive(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    await this.usersService.update(id, { isActive: !user.isActive });
    return { userId: id, isActive: !user.isActive };
  }

  // 사용자 삭제 (논리적 삭제, master만)
  @Delete(':id')
  @Roles('master')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: '삭제(비활성화) 완료' };
  }
}
