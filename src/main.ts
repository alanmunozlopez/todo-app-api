import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { Request, Response } from 'express';

let app: INestApplication;

async function createApp(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule);

    const allowedOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
      : ['http://localhost:5173'];

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  }
  return app;
}

export default async (req: Request, res: Response): Promise<void> => {
  const nestApplication = await createApp();
  const httpAdapter = nestApplication.getHttpAdapter();
  const instance = httpAdapter.getInstance() as (
    req: Request,
    res: Response,
  ) => void;
  return instance(req, res);
};

async function bootstrap() {
  const application = await NestFactory.create(AppModule);

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:5173'];

  application.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  application.useGlobalPipes(new ValidationPipe());
  await application.listen(process.env.PORT ?? 3000);
}

if (process.env.NODE_ENV !== 'production') {
  void bootstrap();
}
