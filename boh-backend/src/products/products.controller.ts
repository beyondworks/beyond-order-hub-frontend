import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBody, ApiBearerAuth } from '@nestjs/swagger';

// CreateProductDto 정의 (실제로는 src/products/dto/create-product.dto.ts로 분리 권장)
export class CreateProductDto {
  productCode: string;
  name: string;
  description?: string;
  category?: string;
  supplier?: string;
  purchasePrice?: number;
  sellingPrice: number;
  stockQuantity: number;
  safeStockQuantity?: number;
  imageUrl?: string;
  status?: '판매중' | '품절' | '숨김' | '판매중지';
  options?: any;
}

export class UpdateProductDto {
  productCode?: string;
  name?: string;
  description?: string;
  category?: string;
  supplier?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  stockQuantity?: number;
  safeStockQuantity?: number;
  imageUrl?: string;
  status?: '판매중' | '품절' | '숨김' | '판매중지';
  options?: any;
}

@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 상품 전체 조회 (검색/필터/페이지네이션은 추후 확장)
  @Get()
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  // 상품 단일 조회
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  // 상품 생성 (master만)
  @Post()
  @Roles('master')
  @ApiBody({ type: CreateProductDto })
  async create(@Body() product: CreateProductDto): Promise<Product> {
    return this.productsService.create(product);
  }

  // 상품 수정 (master만)
  @Put(':id')
  @Roles('master')
  @ApiBody({ type: UpdateProductDto })
  async update(@Param('id') id: string, @Body() product: UpdateProductDto): Promise<Product> {
    return this.productsService.update(id, product);
  }

  // 상품 삭제 (master만, 실제로는 숨김 처리 권장)
  @Delete(':id')
  @Roles('master')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
