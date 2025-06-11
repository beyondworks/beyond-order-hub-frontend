import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      order: { dateTime: 'DESC' },
      take: 100,
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다.');
    return order;
  }

  async create(order: Partial<Order>): Promise<Order> {
    const newOrder = this.ordersRepository.create(order);
    return this.ordersRepository.save(newOrder);
  }

  async update(id: string, order: Partial<Order>): Promise<Order> {
    const existing = await this.findOne(id);
    Object.assign(existing, order);
    return this.ordersRepository.save(existing);
  }

  async remove(id: string): Promise<{ message: string }> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
    return { message: '삭제 완료' };
  }
}
