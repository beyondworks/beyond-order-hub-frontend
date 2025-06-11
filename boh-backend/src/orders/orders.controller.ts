import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

// CreateOrderDto 정의 (실제로는 src/orders/dto/create-order.dto.ts로 분리 권장)
export class CreateOrderDto {
  platform: string;
  platformOrderId: string;
  dateTime: string; // ISO 문자열
  customerName: string;
  productSummary: string;
  totalQuantity: number;
  totalAmount: number;
  status: string;
}

export class UpdateOrderDto {
  platform?: string;
  platformOrderId?: string;
  dateTime?: string;
  customerName?: string;
  productSummary?: string;
  totalQuantity?: number;
  totalAmount?: number;
  status?: string;
}

@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 주문 전체 조회 (검색/필터/페이지네이션은 추후 확장)
  @Get()
  async findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  // 주문 단일 조회
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  // 주문 생성 (master만)
  @Post()
  @Roles('master')
  @ApiBody({ type: CreateOrderDto })
  async create(@Body() order: CreateOrderDto): Promise<Order> {
    // dateTime을 string(ISO)로 받으면 Date 객체로 변환
    const orderData = { ...order, dateTime: new Date(order.dateTime) };
    return this.ordersService.create(orderData);
  }

  // 주문 수정 (master만)
  @Put(':id')
  @Roles('master')
  @ApiBody({ type: UpdateOrderDto })
  async update(@Param('id') id: string, @Body() order: UpdateOrderDto): Promise<Order> {
    // dateTime이 string이면 Date로 변환
    let orderData: any = { ...order };
    if (order.dateTime) {
      orderData.dateTime = new Date(order.dateTime);
    }
    return this.ordersService.update(id, orderData);
  }

  // 주문 삭제 (master만)
  @Delete(':id')
  @Roles('master')
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
