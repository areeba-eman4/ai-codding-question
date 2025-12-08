import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
   app.enableCors({
    origin: [
      process.env.FRONTEND_URL,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allowed HTTP methods
    credentials: true, // Allow cookies and authentication headers to be sent
  });
  await app.listen(process.env.PORT ?? 4000);
  console.log(`Application is running on: http://localhost:4000`);

}
bootstrap();
