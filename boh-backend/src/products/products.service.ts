import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      where: [
        { status: '판매중' },
        { status: '품절' }
      ]
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.');
    return product;
  }

  async create(product: Partial<Product>): Promise<Product> {
    const newProduct = this.productsRepository.create(product);
    return this.productsRepository.save(newProduct);
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const existing = await this.findOne(id);
    Object.assign(existing, product);
    return this.productsRepository.save(existing);
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.findOne(id);
    // 실제로는 숨김 처리 권장
    await this.productsRepository.remove(product);
    return { message: '삭제 완료' };
  }
}
