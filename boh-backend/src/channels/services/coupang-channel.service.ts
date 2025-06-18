import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

interface CoupangChannelConfig {
  accessKey?: string;
  secretKey?: string;
  vendorId?: string;
}

@Injectable()
export class CoupangChannelService {
  private readonly logger = new Logger(CoupangChannelService.name);
  private readonly COUPANG_API_BASE = 'https://api-gateway.coupang.com';

  constructor(private readonly httpService: HttpService) {}

  async testConnection(config: CoupangChannelConfig): Promise<{ success: boolean; message: string }> {
    try {
      if (!config.accessKey || !config.secretKey || !config.vendorId) {
        return {
          success: false,
          message: 'Access Key, Secret Key, Vendor ID가 모두 필요합니다.',
        };
      }

      // 쿠팡 판매자 정보 조회 API 호출
      const path = '/v2/providers/seller_api/apis/api/v1/marketplace/seller-info';
      const headers = this.generateCoupangHeaders('GET', path, config);

      const response = await firstValueFrom(
        this.httpService.get(`${this.COUPANG_API_BASE}${path}`, {
          headers,
          timeout: 10000,
        }),
      );

      if (response.data?.code === 'SUCCESS') {
        this.logger.log('쿠팡 연결 테스트 성공');
        return {
          success: true,
          message: '쿠팡 연결 성공',
        };
      }

      return {
        success: false,
        message: `API 응답 오류: ${response.data?.message || 'Unknown error'}`,
      };
    } catch (error) {
      this.logger.error('쿠팡 연결 테스트 실패:', error.message);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          message: '인증 정보가 올바르지 않습니다.',
        };
      }

      return {
        success: false,
        message: `연결 실패: ${error.message}`,
      };
    }
  }

  async syncOrders(config: CoupangChannelConfig): Promise<{ success: boolean; count: number; message: string }> {
    try {
      if (!config.accessKey || !config.secretKey || !config.vendorId) {
        throw new Error('쿠팡 API 설정이 불완전합니다.');
      }

      // 최근 7일간의 주문 조회
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const path = '/v2/providers/seller_api/apis/api/v1/marketplace/orders';
      const headers = this.generateCoupangHeaders('GET', path, config);

      const response = await firstValueFrom(
        this.httpService.get(`${this.COUPANG_API_BASE}${path}`, {
          headers,
          params: {
            createdAtFrom: startDate.toISOString(),
            createdAtTo: endDate.toISOString(),
            maxPerPage: 50,
          },
          timeout: 30000,
        }),
      );

      const orders = response.data?.data?.content || [];
      
      // 여기서 실제로는 주문 데이터를 데이터베이스에 저장해야 함
      // 현재는 Mock 처리
      this.logger.log(`쿠팡에서 ${orders.length}개 주문 동기화 완료`);

      return {
        success: true,
        count: orders.length,
        message: `${orders.length}개 주문 동기화 완료`,
      };
    } catch (error) {
      this.logger.error('쿠팡 주문 동기화 실패:', error.message);
      throw new Error(`주문 동기화 실패: ${error.message}`);
    }
  }

  private generateCoupangHeaders(method: string, path: string, config: CoupangChannelConfig): any {
    const timestamp = Date.now().toString();
    const message = `${method}${path}${config.accessKey}${timestamp}`;
    
    const signature = crypto
      .createHmac('sha256', config.secretKey)
      .update(message)
      .digest('hex');

    return {
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': `CEA algorithm=HmacSHA256, access-key=${config.accessKey}, signed-date=${timestamp}, signature=${signature}`,
      'X-EXTENDED-TIMEOUT': '90000',
    };
  }

  async getProductPricing(productId: string, config: CoupangChannelConfig): Promise<any> {
    try {
      const path = `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${productId}/prices`;
      const headers = this.generateCoupangHeaders('GET', path, config);

      const response = await firstValueFrom(
        this.httpService.get(`${this.COUPANG_API_BASE}${path}`, {
          headers,
          timeout: 10000,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`쿠팡 상품 가격 조회 실패 (${productId}):`, error.message);
      throw error;
    }
  }

  async updateInventory(productId: string, stock: number, config: CoupangChannelConfig): Promise<boolean> {
    try {
      const path = `/v2/providers/seller_api/apis/api/v1/marketplace/vendor-items/${productId}/prices/quantity`;
      const headers = this.generateCoupangHeaders('PUT', path, config);

      const response = await firstValueFrom(
        this.httpService.put(
          `${this.COUPANG_API_BASE}${path}`,
          { quantity: stock },
          { headers, timeout: 10000 },
        ),
      );

      return response.data?.code === 'SUCCESS';
    } catch (error) {
      this.logger.error(`쿠팡 재고 업데이트 실패 (${productId}):`, error.message);
      return false;
    }
  }
}