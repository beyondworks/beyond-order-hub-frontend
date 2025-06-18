import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel, ChannelStatus, ChannelType } from './channel.entity';
import { ChannelConfigDto, TestConnectionDto } from './dto/channel-config.dto';
import { NaverChannelService } from './services/naver-channel.service';
import { CoupangChannelService } from './services/coupang-channel.service';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private naverChannelService: NaverChannelService,
    private coupangChannelService: CoupangChannelService,
  ) {}

  async initializeDefaultChannels(): Promise<void> {
    const defaultChannels = [
      {
        channelId: 'naver',
        name: '네이버 스마트스토어',
        type: ChannelType.OAUTH,
        description: '네이버 스마트스토어 연동으로 상품 및 주문 관리',
      },
      {
        channelId: 'coupang',
        name: '쿠팡',
        type: ChannelType.API,
        description: '쿠팡 파트너스 연동으로 판매 관리',
      },
      {
        channelId: '29cm',
        name: '29CM',
        type: ChannelType.WEBHOOK,
        description: '29CM 연동으로 패션 상품 판매',
      },
      {
        channelId: 'ohouse',
        name: '오늘의집',
        type: ChannelType.WEBHOOK,
        description: '오늘의집 연동으로 홈 인테리어 상품 판매',
      },
      {
        channelId: 'cjonstyle',
        name: 'CJ온스타일',
        type: ChannelType.API,
        description: 'CJ온스타일 TV 쇼핑 연동',
      },
      {
        channelId: 'kakao',
        name: '카카오톡 스토어',
        type: ChannelType.OAUTH,
        description: '카카오톡 스토어 연동으로 소셜 커머스',
      },
      {
        channelId: 'imweb',
        name: '아임웹',
        type: ChannelType.API,
        description: '아임웹 쇼핑몰 연동',
      },
      {
        channelId: 'toss',
        name: '토스쇼핑',
        type: ChannelType.API,
        description: '토스쇼핑 연동으로 간편 결제',
      },
    ];

    for (const channelData of defaultChannels) {
      const existingChannel = await this.channelRepository.findOne({
        where: { channelId: channelData.channelId },
      });

      if (!existingChannel) {
        const channel = this.channelRepository.create(channelData);
        await this.channelRepository.save(channel);
      }
    }
  }

  async findAll(): Promise<Channel[]> {
    return this.channelRepository.find({
      select: ['id', 'channelId', 'name', 'type', 'status', 'description', 'lastSync'],
      order: { channelId: 'ASC' },
    });
  }

  async findOne(channelId: string): Promise<Channel> {
    const channel = await this.channelRepository.findOne({
      where: { channelId },
    });

    if (!channel) {
      throw new NotFoundException(`Channel ${channelId} not found`);
    }

    return channel;
  }

  async updateConfig(channelId: string, configDto: ChannelConfigDto): Promise<Channel> {
    const channel = await this.findOne(channelId);
    
    // 설정 업데이트
    channel.config = {
      ...channel.config,
      clientId: configDto.clientId,
      clientSecret: configDto.clientSecret,
      accessKey: configDto.accessKey,
      secretKey: configDto.secretKey,
      vendorId: configDto.vendorId,
      webhookUrl: configDto.webhookUrl,
    };

    // 설정이 완료되면 상태를 pending으로 변경
    if (this.hasRequiredConfig(channel)) {
      channel.status = ChannelStatus.PENDING;
    }

    return this.channelRepository.save(channel);
  }

  async testConnection(channelId: string): Promise<{ success: boolean; message: string }> {
    const channel = await this.findOne(channelId);

    if (!this.hasRequiredConfig(channel)) {
      throw new BadRequestException('Channel configuration is incomplete');
    }

    try {
      let success = false;
      let message = '';

      switch (channelId) {
        case 'naver':
          const naverResult = await this.naverChannelService.testConnection(channel.config);
          success = naverResult.success;
          message = naverResult.message;
          break;

        case 'coupang':
          const coupangResult = await this.coupangChannelService.testConnection(channel.config);
          success = coupangResult.success;
          message = coupangResult.message;
          break;

        default:
          // 다른 채널들은 아직 구현되지 않음
          success = true;
          message = '연결 테스트 성공 (Mock)';
          break;
      }

      // 상태 업데이트
      channel.status = success ? ChannelStatus.CONNECTED : ChannelStatus.ERROR;
      channel.lastError = success ? null : message;
      channel.lastSync = success ? new Date() : channel.lastSync;
      
      await this.channelRepository.save(channel);

      return { success, message };
    } catch (error) {
      // 오류 발생 시 상태 업데이트
      channel.status = ChannelStatus.ERROR;
      channel.lastError = error.message;
      await this.channelRepository.save(channel);

      throw new BadRequestException(`Connection test failed: ${error.message}`);
    }
  }

  async syncOrders(channelId: string): Promise<{ success: boolean; count: number; message: string }> {
    const channel = await this.findOne(channelId);

    if (channel.status !== ChannelStatus.CONNECTED) {
      throw new BadRequestException('Channel is not connected');
    }

    try {
      let result = { success: false, count: 0, message: '' };

      switch (channelId) {
        case 'naver':
          result = await this.naverChannelService.syncOrders(channel.config);
          break;

        case 'coupang':
          result = await this.coupangChannelService.syncOrders(channel.config);
          break;

        default:
          // Mock 결과
          result = { success: true, count: 5, message: '주문 동기화 완료 (Mock)' };
          break;
      }

      // 마지막 동기화 시간 업데이트
      if (result.success) {
        channel.lastSync = new Date();
        await this.channelRepository.save(channel);
      }

      return result;
    } catch (error) {
      channel.status = ChannelStatus.ERROR;
      channel.lastError = error.message;
      await this.channelRepository.save(channel);

      throw new BadRequestException(`Order sync failed: ${error.message}`);
    }
  }

  private hasRequiredConfig(channel: Channel): boolean {
    if (!channel.config) return false;

    switch (channel.type) {
      case ChannelType.OAUTH:
        return !!(channel.config.clientId && channel.config.clientSecret);
      case ChannelType.API:
        if (channel.channelId === 'coupang') {
          return !!(channel.config.accessKey && channel.config.secretKey && channel.config.vendorId);
        }
        return !!(channel.config.accessKey && channel.config.secretKey);
      case ChannelType.WEBHOOK:
        return !!channel.config.webhookUrl;
      default:
        return false;
    }
  }
}