import { Controller, Get } from '@nestjs/common';

@Controller('errors')
export class ErrorsController {
  @Get()
  getErrors() {
    // 임시 더미 데이터 반환
    return [
      { id: 1, message: '에러 로그 예시', resolved: false },
    ];
  }
} 