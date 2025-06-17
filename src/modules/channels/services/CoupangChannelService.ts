import { BaseChannelService } from './BaseChannelService';
import { CoupangChannelConfig, ChannelSyncResult } from '../types/channel.types';

export class CoupangChannelService extends BaseChannelService {
  private config: CoupangChannelConfig;
  private readonly BASE_URL = 'https://api-gateway.coupang.com';

  constructor(config: CoupangChannelConfig) {
    super(config);
    this.config = config;
  }

  async authenticate(): Promise<boolean> {
    try {
      this.log('Validating Coupang credentials...');
      
      // 쿠팡은 API 키 기반 인증이므로 연결 테스트로 인증 확인
      const isValid = await this.testConnection();
      
      if (isValid) {
        this.config.status = 'connected';
        this.log('Coupang authentication successful');
      } else {
        this.config.status = 'error';
        this.log('Coupang authentication failed');
      }
      
      return isValid;
    } catch (error) {
      this.logError('Coupang authentication failed', error);
      this.config.status = 'error';
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      this.log('Testing Coupang connection...');
      
      // 쿠팡 판매자 정보 조회 API
      const response = await this.makeCoupangApiRequest('/v2/providers/seller_api/apis/api/v1/marketplace/seller-info');
      
      if (response.code === 'SUCCESS') {
        this.config.status = 'connected';
        this.config.lastSync = new Date().toISOString();
        this.log('Coupang connection test successful');
        return true;
      } else {
        throw new Error(`API returned error: ${response.message}`);
      }
    } catch (error) {
      this.logError('Coupang connection test failed', error);
      this.config.status = 'error';
      return false;
    }
  }

  async syncProducts(): Promise<ChannelSyncResult> {
    try {
      this.log('Starting Coupang product sync...');
      
      // 쿠팡 상품 목록 조회 API
      const response = await this.makeCoupangApiRequest('/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items');
      
      const processedCount = response.data?.content?.length || 0;
      
      this.log(`Coupang product sync completed: ${processedCount} products`);

      return {
        channelId: this.config.id,
        syncType: 'products',
        success: true,
        processedCount,
        errorCount: 0,
        lastSyncTime: new Date().toISOString(),
      };
    } catch (error) {
      this.logError('Coupang product sync failed', error);
      
      return {
        channelId: this.config.id,
        syncType: 'products',
        success: false,
        processedCount: 0,
        errorCount: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastSyncTime: new Date().toISOString(),
      };
    }
  }

  async syncOrders(): Promise<ChannelSyncResult> {
    try {
      this.log('Starting Coupang order sync...');
      
      // 쿠팡 주문 목록 조회 API
      const response = await this.makeCoupangApiRequest('/v2/providers/seller_api/apis/api/v1/marketplace/orders');
      
      const processedCount = response.data?.content?.length || 0;
      
      this.log(`Coupang order sync completed: ${processedCount} orders`);

      return {
        channelId: this.config.id,
        syncType: 'orders',
        success: true,
        processedCount,
        errorCount: 0,
        lastSyncTime: new Date().toISOString(),
      };
    } catch (error) {
      this.logError('Coupang order sync failed', error);
      
      return {
        channelId: this.config.id,
        syncType: 'orders',
        success: false,
        processedCount: 0,
        errorCount: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastSyncTime: new Date().toISOString(),
      };
    }
  }

  async updateInventory(productId: string, stock: number): Promise<boolean> {
    try {
      this.log(`Updating Coupang inventory for product ${productId}: ${stock}`);
      
      // 쿠팡 재고 업데이트 API
      const response = await this.makeCoupangApiRequest(
        `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${productId}/prices/quantity`,
        'PUT',
        { quantity: stock }
      );

      if (response.code === 'SUCCESS') {
        this.log(`Coupang inventory updated successfully for product ${productId}`);
        return true;
      } else {
        throw new Error(`API returned error: ${response.message}`);
      }
    } catch (error) {
      this.logError(`Coupang inventory update failed for product ${productId}`, error);
      return false;
    }
  }

  // 쿠팡 특화 API 호출 메서드
  private async makeCoupangApiRequest(
    endpoint: string, 
    method: string = 'GET', 
    body?: any
  ): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const authorization = this.generateCoupangAuthorization(method, endpoint, timestamp);

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': authorization,
          'X-EXTENDED-TIMEOUT': '90000',
        },
      };

      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const url = `${this.BASE_URL}${endpoint}`;
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logError('Coupang API request failed', error);
      throw error;
    }
  }

  // 쿠팡 API 인증 헤더 생성
  private generateCoupangAuthorization(method: string, path: string, timestamp: string): string {
    // 실제 구현에서는 HMAC-SHA256 서명 생성이 필요
    // 현재는 기본 형태만 구현
    const message = `${method}${path}${this.config.accessKey}${timestamp}`;
    
    // 실제로는 crypto를 사용한 HMAC 서명이 필요:
    // const signature = crypto.createHmac('sha256', this.config.secretKey).update(message).digest('hex');
    
    // Mock signature for development
    const signature = 'mock_signature';
    
    return `CEA algorithm=HmacSHA256, access-key=${this.config.accessKey}, signed-date=${timestamp}, signature=${signature}`;
  }

  // 쿠팡 특화 메서드들
  async getProductPricing(productId: string): Promise<any> {
    try {
      return await this.makeCoupangApiRequest(`/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${productId}/prices`);
    } catch (error) {
      this.logError(`Failed to get product pricing for ${productId}`, error);
      throw error;
    }
  }

  async updateProductPrice(productId: string, price: number): Promise<boolean> {
    try {
      const response = await this.makeCoupangApiRequest(
        `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${productId}/prices`,
        'PUT',
        { originalPrice: price, salePrice: price }
      );

      return response.code === 'SUCCESS';
    } catch (error) {
      this.logError(`Failed to update product price for ${productId}`, error);
      return false;
    }
  }
}