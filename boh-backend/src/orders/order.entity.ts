import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  platform: string;

  @Column()
  platformOrderId: string;

  @Column({ type: 'timestamp' })
  dateTime: Date;

  @Column()
  customerName: string;

  @Column()
  productSummary: string;

  @Column({ type: 'int' })
  totalQuantity: number;

  @Column({ type: 'decimal' })
  totalAmount: number;

  @Column()
  status: string;

  @Column({ default: false })
  hasReturnOrExchange: boolean;

  @Column({ nullable: true })
  returnStatus?: string;

  @Column({ nullable: true })
  shippingCarrier?: string;

  @Column({ nullable: true })
  shippingTrackingNumber?: string;

  @Column({ type: 'timestamp', nullable: true })
  shippingDate?: Date;

  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 