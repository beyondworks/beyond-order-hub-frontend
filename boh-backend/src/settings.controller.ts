import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('settings')
export class SettingsController {
  constructor(private configService: ConfigService) {}

  @Get('platform-configs')
  getPlatformConfigs() {
    return [
      {
        id: 'coupang',
        name: '쿠팡',
        isActive: !!this.configService.get('COUPANG_API_KEY'),
        apiKey: this.configService.get('COUPANG_API_KEY'),
      },
      {
        id: 'smartstore',
        name: '네이버 스마트스토어',
        isActive: !!this.configService.get('NAVER_CLIENT_ID'),
        clientId: this.configService.get('NAVER_CLIENT_ID'),
        clientSecret: this.configService.get('NAVER_CLIENT_SECRET'),
      },
      {
        id: 'todayhouse',
        name: '오늘의집',
        isActive: !!this.configService.get('TODAYHOUSE_API_KEY'),
        apiKey: this.configService.get('TODAYHOUSE_API_KEY'),
      },
      {
        id: '29cm',
        name: '29CM',
        isActive: !!this.configService.get('CM29_API_KEY'),
        apiKey: this.configService.get('CM29_API_KEY'),
        vendorId: this.configService.get('CM29_VENDOR_ID'),
      },
      {
        id: 'imweb',
        name: '아임웹',
        isActive: !!this.configService.get('IMWEB_API_KEY'),
        apiKey: this.configService.get('IMWEB_API_KEY'),
        apiSecret: this.configService.get('IMWEB_API_SECRET'),
      },
    ];
  }

  @Get('3pl-config')
  get3PLConfig() {
    return {
      apiUrl: this.configService.get('THREEPL_API_URL'),
      apiKey: this.configService.get('THREEPL_API_KEY'),
      isActive: !!this.configService.get('THREEPL_API_KEY'),
    };
  }
} 