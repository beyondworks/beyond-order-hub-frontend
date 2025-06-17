import { ChannelConfig, ChannelProduct, ChannelOrder, ChannelSyncResult } from '../types/channel.types';

export abstract class BaseChannelService {
  protected config: ChannelConfig;

  constructor(config: ChannelConfig) {
    this.config = config;
  }

  // 필수 구현 메서드들
  abstract authenticate(): Promise<boolean>;
  abstract testConnection(): Promise<boolean>;
  abstract syncProducts(): Promise<ChannelSyncResult>;
  abstract syncOrders(): Promise<ChannelSyncResult>;
  abstract updateInventory(productId: string, stock: number): Promise<boolean>;

  // 공통 메서드들
  public getChannelId(): string {
    return this.config.id;
  }

  public getChannelName(): string {
    return this.config.name;
  }

  public getConfig(): ChannelConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<ChannelConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 헬퍼 메서드들
  protected async makeApiRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[${this.config.name}] API request error:`, error);
      throw error;
    }
  }

  protected log(message: string, data?: any): void {
    console.log(`[${this.config.name}] ${message}`, data || '');
  }

  protected logError(message: string, error?: any): void {
    console.error(`[${this.config.name}] ${message}`, error || '');
  }
}