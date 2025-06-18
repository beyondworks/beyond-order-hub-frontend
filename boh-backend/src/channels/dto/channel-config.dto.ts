import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ChannelType } from '../channel.entity';

export class ChannelConfigDto {
  @IsString()
  channelId: string;

  @IsString()
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientSecret?: string;

  @IsOptional()
  @IsString()
  accessKey?: string;

  @IsOptional()
  @IsString()
  secretKey?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  webhookUrl?: string;
}

export class TestConnectionDto {
  @IsString()
  channelId: string;
}

export class SyncOrdersDto {
  @IsString()
  channelId: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}