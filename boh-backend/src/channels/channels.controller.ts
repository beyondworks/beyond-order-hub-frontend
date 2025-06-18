import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ChannelsService } from './channels.service';
import { ChannelConfigDto, TestConnectionDto } from './dto/channel-config.dto';
import { Channel } from './channel.entity';

@ApiTags('channels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @Roles('master', 'user')
  @ApiOperation({ summary: '모든 채널 목록 조회' })
  @ApiResponse({ status: 200, description: '채널 목록 조회 성공' })
  async findAll(): Promise<Channel[]> {
    return this.channelsService.findAll();
  }

  @Get(':channelId')
  @Roles('master', 'user')
  @ApiOperation({ summary: '특정 채널 조회' })
  @ApiResponse({ status: 200, description: '채널 조회 성공' })
  @ApiResponse({ status: 404, description: '채널을 찾을 수 없음' })
  async findOne(@Param('channelId') channelId: string): Promise<Channel> {
    return this.channelsService.findOne(channelId);
  }

  @Put(':channelId/config')
  @Roles('master', 'user')
  @ApiOperation({ summary: '채널 설정 업데이트' })
  @ApiResponse({ status: 200, description: '설정 업데이트 성공' })
  @ApiResponse({ status: 404, description: '채널을 찾을 수 없음' })
  async updateConfig(
    @Param('channelId') channelId: string,
    @Body() configDto: ChannelConfigDto,
  ): Promise<Channel> {
    return this.channelsService.updateConfig(channelId, configDto);
  }

  @Post(':channelId/test')
  @Roles('master', 'user')
  @ApiOperation({ summary: '채널 연결 테스트' })
  @ApiResponse({ status: 200, description: '연결 테스트 성공' })
  @ApiResponse({ status: 400, description: '연결 테스트 실패' })
  async testConnection(
    @Param('channelId') channelId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.channelsService.testConnection(channelId);
  }

  @Post(':channelId/sync')
  @Roles('master', 'user')
  @ApiOperation({ summary: '채널 주문 동기화' })
  @ApiResponse({ status: 200, description: '주문 동기화 성공' })
  @ApiResponse({ status: 400, description: '주문 동기화 실패' })
  async syncOrders(
    @Param('channelId') channelId: string,
  ): Promise<{ success: boolean; count: number; message: string }> {
    return this.channelsService.syncOrders(channelId);
  }

  @Post('sync-all')
  @Roles('master')
  @ApiOperation({ summary: '모든 채널 주문 동기화' })
  @ApiResponse({ status: 200, description: '전체 동기화 성공' })
  async syncAllChannels(): Promise<{ results: any[] }> {
    const channels = await this.channelsService.findAll();
    const results = [];

    for (const channel of channels) {
      if (channel.status === 'connected') {
        try {
          const result = await this.channelsService.syncOrders(channel.channelId);
          results.push({ channelId: channel.channelId, ...result });
        } catch (error) {
          results.push({
            channelId: channel.channelId,
            success: false,
            count: 0,
            message: error.message,
          });
        }
      }
    }

    return { results };
  }
}