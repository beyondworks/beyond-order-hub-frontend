import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { Channel } from './channel.entity';
import { NaverChannelService } from './services/naver-channel.service';
import { CoupangChannelService } from './services/coupang-channel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, NaverChannelService, CoupangChannelService],
  exports: [ChannelsService],
})
export class ChannelsModule {}