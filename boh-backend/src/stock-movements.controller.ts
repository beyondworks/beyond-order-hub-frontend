import { Controller, Get } from '@nestjs/common';

@Controller('stock-movements')
export class StockMovementsController {
  @Get()
  getStockMovements() {
    // 임시 더미 데이터 반환
    return [
      { id: 1, product: '상품A', movement: '+10', date: new Date() },
      { id: 2, product: '상품B', movement: '-5', date: new Date() },
    ];
  }
} 