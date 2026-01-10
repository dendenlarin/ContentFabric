import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS с конфигурацией
  app.enableCors({
    origin: configService.get<string>('cors.origin'),
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('ContentFabric API')
    .setDescription('API для генерации контента с использованием промптов и параметров')
    .setVersion('1.0')
    .addTag('parameters', 'Управление параметрами для шаблонов')
    .addTag('prompt-templates', 'Управление шаблонами промптов')
    .addTag('generated-prompts', 'Сгенерированные промпты')
    .addTag('generations', 'Задачи генерации контента')
    .addTag('generation-results', 'Результаты генерации')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('port') ?? 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
