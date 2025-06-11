import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  productCode: string; // SKU

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  supplier?: string;

  @Column({ type: 'decimal', nullable: true })
  purchasePrice?: number;

  @Column({ type: 'decimal' })
  sellingPrice: number;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'int', nullable: true })
  safeStockQuantity?: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar', default: '판매중' })
  status: '판매중' | '품절' | '숨김' | '판매중지';

  @Column({ type: 'jsonb', nullable: true })
  options?: any;

  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 