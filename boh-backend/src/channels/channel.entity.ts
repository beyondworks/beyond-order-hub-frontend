import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ChannelType {
  OAUTH = 'oauth',
  API = 'api',
  WEBHOOK = 'webhook',
}

export enum ChannelStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
  ERROR = 'error',
}

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  channelId: string; // 'naver', 'coupang', etc.

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ChannelType,
  })
  type: ChannelType;

  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.DISCONNECTED,
  })
  status: ChannelStatus;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  config: {
    clientId?: string;
    clientSecret?: string;
    accessKey?: string;
    secretKey?: string;
    vendorId?: string;
    webhookUrl?: string;
    accessToken?: string;
    refreshToken?: string;
  };

  @Column({ nullable: true })
  lastSync: Date;

  @Column({ nullable: true })
  lastError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}