import { Controller, Get } from '@nestjs/common';

@Controller('settings')
export class SettingsController {
  @Get('platform-configs')
  getPlatformConfigs() {
    // 임시 더미 데이터 반환
    return [
      { id: 1, name: '네이버', isActive: true },
      { id: 2, name: '쿠팡', isActive: false },
    ];
  }

  @Get('3pl-config')
  get3PLConfig() {
    // 임시 더미 데이터 반환
    return { id: 1, name: '3PL 업체', isActive: true };
  }
} 