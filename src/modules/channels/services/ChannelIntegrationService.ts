import { BaseChannelService } from './BaseChannelService';
import { NaverChannelService } from './NaverChannelService';
import { CoupangChannelService } from './CoupangChannelService';
import { 
  ChannelConfig, 
  NaverChannelConfig, 
  CoupangChannelConfig,
  ChannelSyncResult,
  ChannelStats 
} from '../types/channel.types';

export class ChannelIntegrationService {
  private channels = new Map<string, BaseChannelService>();
  private syncResults = new Map<string, ChannelSyncResult[]>();

  constructor() {
    this.initializeDefaultChannels();
  }

  // 기본 채널 설정 초기화
  private initializeDefaultChannels(): void {
    const defaultChannels: ChannelConfig[] = [
      {
        id: 'naver',
        name: '네이버 스마트스토어',
        type: 'oauth',
        status: 'disconnected',
        logoUrl: '/assets/logos/naver.png',
        description: '네이버 스마트스토어 연동으로 상품 및 주문 관리',
        clientId: '',
        clientSecret: '',
      } as NaverChannelConfig,
      {
        id: 'coupang',
        name: '쿠팡',
        type: 'api',
        status: 'disconnected',
        logoUrl: '/assets/logos/coupang.png',
        description: '쿠팡 파트너스 연동으로 판매 관리',
        vendorId: '',
        accessKey: '',
        secretKey: '',
      } as CoupangChannelConfig,
      {
        id: '29cm',
        name: '29CM',
        type: 'webhook',
        status: 'disconnected',
        logoUrl: '/assets/logos/29cm.png',
        description: '29CM 연동으로 패션 상품 판매',
      },
      {
        id: 'ohouse',
        name: '오늘의집',
        type: 'webhook',
        status: 'disconnected',
        logoUrl: '/assets/logos/ohouse.png',
        description: '오늘의집 연동으로 홈 인테리어 상품 판매',
      },
      {
        id: 'cjonstyle',
        name: 'CJ온스타일',
        type: 'api',
        status: 'disconnected',
        logoUrl: '/assets/logos/cjonstyle.png',
        description: 'CJ온스타일 TV 쇼핑 연동',
      },
      {
        id: 'kakao',
        name: '카카오톡 스토어',
        type: 'oauth',
        status: 'disconnected',
        logoUrl: '/assets/logos/kakao.png',
        description: '카카오톡 스토어 연동으로 소셜 커머스',
      },
      {
        id: 'imweb',
        name: '아임웹',
        type: 'api',
        status: 'disconnected',
        logoUrl: '/assets/logos/imweb.png',
        description: '아임웹 쇼핑몰 연동',
      },
      {
        id: 'toss',
        name: '토스쇼핑',
        type: 'api',
        status: 'disconnected',
        logoUrl: '/assets/logos/toss.png',
        description: '토스쇼핑 연동으로 간편 결제',
      },
    ];

    // 기본 채널들을 등록하되, 실제 서비스는 설정 완료 후 생성
    defaultChannels.forEach(config => {
      this.syncResults.set(config.id, []);
    });
  }

  // 채널 등록
  registerChannel(config: ChannelConfig): boolean {
    try {
      let service: BaseChannelService;

      switch (config.id) {
        case 'naver':
          service = new NaverChannelService(config as NaverChannelConfig);
          break;
        case 'coupang':
          service = new CoupangChannelService(config as CoupangChannelConfig);
          break;
        default:
          console.warn(`Channel ${config.id} not implemented yet`);
          return false;
      }

      this.channels.set(config.id, service);
      console.log(`Channel ${config.name} registered successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to register channel ${config.name}:`, error);
      return false;
    }
  }

  // 채널 연결 해제
  unregisterChannel(channelId: string): boolean {
    try {
      if (this.channels.has(channelId)) {
        this.channels.delete(channelId);
        console.log(`Channel ${channelId} unregistered successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to unregister channel ${channelId}:`, error);
      return false;
    }
  }

  // 특정 채널 서비스 가져오기
  getChannelService(channelId: string): BaseChannelService | undefined {
    return this.channels.get(channelId);
  }

  // 등록된 모든 채널 가져오기
  getAllChannels(): BaseChannelService[] {
    return Array.from(this.channels.values());
  }

  // 채널별 연결 상태 확인
  async testAllConnections(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    const testPromises = Array.from(this.channels.entries()).map(async ([channelId, service]) => {
      try {
        const isConnected = await service.testConnection();
        results.set(channelId, isConnected);
        return { channelId, isConnected };
      } catch (error) {
        console.error(`Connection test failed for ${channelId}:`, error);
        results.set(channelId, false);
        return { channelId, isConnected: false };
      }
    });

    await Promise.allSettled(testPromises);
    return results;
  }

  // 모든 채널 상품 동기화
  async syncAllProducts(): Promise<Map<string, ChannelSyncResult>> {
    const results = new Map<string, ChannelSyncResult>();
    
    const syncPromises = Array.from(this.channels.entries()).map(async ([channelId, service]) => {
      try {
        const result = await service.syncProducts();
        results.set(channelId, result);
        this.addSyncResult(channelId, result);
        return result;
      } catch (error) {
        console.error(`Product sync failed for ${channelId}:`, error);
        const errorResult: ChannelSyncResult = {
          channelId,
          syncType: 'products',
          success: false,
          processedCount: 0,
          errorCount: 1,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          lastSyncTime: new Date().toISOString(),
        };
        results.set(channelId, errorResult);
        return errorResult;
      }
    });

    await Promise.allSettled(syncPromises);
    return results;
  }

  // 모든 채널 주문 동기화
  async syncAllOrders(): Promise<Map<string, ChannelSyncResult>> {
    const results = new Map<string, ChannelSyncResult>();
    
    const syncPromises = Array.from(this.channels.entries()).map(async ([channelId, service]) => {
      try {
        const result = await service.syncOrders();
        results.set(channelId, result);
        this.addSyncResult(channelId, result);
        return result;
      } catch (error) {
        console.error(`Order sync failed for ${channelId}:`, error);
        const errorResult: ChannelSyncResult = {
          channelId,
          syncType: 'orders',
          success: false,
          processedCount: 0,
          errorCount: 1,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          lastSyncTime: new Date().toISOString(),
        };
        results.set(channelId, errorResult);
        return errorResult;
      }
    });

    await Promise.allSettled(syncPromises);
    return results;
  }

  // 모든 채널 재고 업데이트
  async updateInventoryAllChannels(productId: string, stock: number): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    const updatePromises = Array.from(this.channels.entries()).map(async ([channelId, service]) => {
      try {
        const success = await service.updateInventory(productId, stock);
        results.set(channelId, success);
        return { channelId, success };
      } catch (error) {
        console.error(`Inventory update failed for ${channelId}:`, error);
        results.set(channelId, false);
        return { channelId, success: false };
      }
    });

    await Promise.allSettled(updatePromises);
    return results;
  }

  // 동기화 결과 저장
  private addSyncResult(channelId: string, result: ChannelSyncResult): void {
    const results = this.syncResults.get(channelId) || [];
    results.unshift(result); // 최신 결과를 앞에 추가
    
    // 최대 10개까지만 저장
    if (results.length > 10) {
      results.splice(10);
    }
    
    this.syncResults.set(channelId, results);
  }

  // 채널별 동기화 히스토리 조회
  getSyncHistory(channelId: string): ChannelSyncResult[] {
    return this.syncResults.get(channelId) || [];
  }

  // 전체 채널 통계
  getChannelStats(): Map<string, ChannelStats> {
    const stats = new Map<string, ChannelStats>();
    
    this.channels.forEach((service, channelId) => {
      // 실제 구현에서는 각 채널에서 통계 데이터를 가져와야 함
      const mockStats: ChannelStats = {
        channelId,
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        todayOrders: 0,
        revenue: {
          today: 0,
          thisMonth: 0,
          total: 0,
        },
      };
      
      stats.set(channelId, mockStats);
    });
    
    return stats;
  }

  // 채널 설정 업데이트
  updateChannelConfig(channelId: string, newConfig: Partial<ChannelConfig>): boolean {
    try {
      const service = this.channels.get(channelId);
      if (service) {
        service.updateConfig(newConfig);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to update config for channel ${channelId}:`, error);
      return false;
    }
  }
}