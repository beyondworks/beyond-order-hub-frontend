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

  // CORS 헤더 강제 추가 (preflight 완벽 대응)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
    } else {
      next();
    }
  });

  // CORS 설정 (프론트엔드 개발자 참고)
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'https://beyondworks.github.io'
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
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

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
