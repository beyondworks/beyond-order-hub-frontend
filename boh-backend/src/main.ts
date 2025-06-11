import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import * as bcrypt from 'bcrypt';

async function createDefaultUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const usersToCreate = [
    {
      username: 'master@example.com',
      password: 'password1234',
      role: 'master' as 'master',
      name: '마스터',
    },
    {
      username: 'user@example.com',
      password: 'password1234',
      role: 'user' as 'user',
      name: '유저',
    },
  ];

  for (const userData of usersToCreate) {
    const existing = await userRepository.findOne({ where: { username: userData.username } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const user = userRepository.create({
        username: userData.username,
        password: passwordHash,
        role: userData.role,
        name: userData.name,
        isActive: true,
      });
      await userRepository.save(user);
      console.log(`${userData.username} 계정 생성 완료!`);
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend domains
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('비욘드 오더 허브 API')
    .setDescription('User, Product, Order 등 주요 엔드포인트 명세')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 기본 계정 생성
  const dataSource = app.get(DataSource);
  await createDefaultUsers(dataSource);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Server listening on port ${port}`);
}

bootstrap();
