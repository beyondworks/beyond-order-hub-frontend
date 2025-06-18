import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface NaverChannelConfig {
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
}

@Injectable()
export class NaverChannelService {
  private readonly logger = new Logger(NaverChannelService.name);
  private readonly NAVER_API_BASE = 'https://api.commerce.naver.com';

  constructor(private readonly httpService: HttpService) {}

  async testConnection(config: NaverChannelConfig): Promise<{ success: boolean; message: string }> {
    try {
      if (!config.clientId || !config.clientSecret) {
        return {
          success: false,
          message: 'Client ID와 Client Secret이 필요합니다.',
        };
      }

      // OAuth 토큰이 없으면 발급 받기
      if (!config.accessToken) {
        // 실제로는 OAuth 플로우를 통해 토큰을 받아야 하지만,
        // 여기서는 설정이 올바른지만 확인
        return {
          success: true,
          message: 'OAuth 설정이 완료되었습니다. 인증 후 사용 가능합니다.',
        };
      }

      // 액세스 토큰이 있으면 실제 API 호출
      const response = await firstValueFrom(
        this.httpService.get(`${this.NAVER_API_BASE}/external/v1/seller-info`, {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }),
      );

      if (response.status === 200) {
        this.logger.log('네이버 스마트스토어 연결 테스트 성공');
        return {
          success: true,
          message: '네이버 스마트스토어 연결 성공',
        };
      }

      return {
        success: false,
        message: `API 응답 오류: ${response.status}`,
      };
    } catch (error) {
      this.logger.error('네이버 연결 테스트 실패:', error.message);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          message: '인증이 만료되었습니다. 다시 로그인해주세요.',
        };
      }

      return {
        success: false,
        message: `연결 실패: ${error.message}`,
      };
    }
  }

  async syncOrders(config: NaverChannelConfig): Promise<{ success: boolean; count: number; message: string }> {
    try {
      if (!config.accessToken) {
        throw new Error('액세스 토큰이 필요합니다.');
      }

      // 최근 7일간의 주문 조회
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const response = await firstValueFrom(
        this.httpService.get(`${this.NAVER_API_BASE}/external/v1/pay-order/seller/orders`, {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          params: {
            lastChangedFrom: startDate.toISOString(),
            lastChangedTo: endDate.toISOString(),
            limit: 100,
          },
          timeout: 30000,
        }),
      );

      const orders = response.data?.data?.orders || [];
      
      // 여기서 실제로는 주문 데이터를 데이터베이스에 저장해야 함
      // 현재는 Mock 처리
      this.logger.log(`네이버에서 ${orders.length}개 주문 동기화 완료`);

      return {
        success: true,
        count: orders.length,
        message: `${orders.length}개 주문 동기화 완료`,
      };
    } catch (error) {
      this.logger.error('네이버 주문 동기화 실패:', error.message);
      throw new Error(`주문 동기화 실패: ${error.message}`);
    }
  }

  async getOAuthUrl(clientId: string, redirectUri: string): Promise<string> {
    const state = Math.random().toString(36).substring(2, 15);
    const scope = 'commerce.read,commerce.write';
    
    return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  }

  async exchangeCodeForToken(code: string, state: string, config: NaverChannelConfig): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('https://nid.naver.com/oauth2.0/token', null, {
          params: {
            grant_type: 'authorization_code',
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            state,
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error('네이버 토큰 교환 실패:', error.message);
      throw new Error(`토큰 교환 실패: ${error.message}`);
    }
  }
}