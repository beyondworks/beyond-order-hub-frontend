import { Controller, Get } from '@nestjs/common';

@Controller('returns')
export class ReturnsController {
  @Get()
  getReturns() {
    // 임시 더미 데이터 반환
    return [
      { id: 1, order: '주문A', status: '요청됨', date: new Date() },
      { id: 2, order: '주문B', status: '완료', date: new Date() },
    ];
  }
} 