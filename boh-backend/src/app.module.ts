import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { ChannelsModule } from './channels/channels.module';
import { ChannelsService } from './channels/channels.service';
import { SettingsController } from './settings.controller';
import { ErrorsController } from './errors.controller';
import { StockMovementsController } from './stock-movements.controller';
import { ReturnsController } from './returns.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true, // 개발 단계에서만 true, 운영에서는 migration 사용
    }),
    UsersModule,
    ProductsModule,
    OrdersModule,
    AuthModule,
    ChannelsModule,
  ],
  controllers: [AppController, SettingsController, ErrorsController, StockMovementsController, ReturnsController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly channelsService: ChannelsService) {}

  async onModuleInit() {
    // 애플리케이션 시작 시 기본 채널들 초기화
    await this.channelsService.initializeDefaultChannels();
  }
}
