import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Puppy Spa API')
    .setDescription('API for managing puppy spa appointments and waiting lists')
    .setVersion('1.0')
    .addTag('waiting-lists', 'Operations for managing waiting lists')
    .addTag('waiting-list-entries', 'Operations for managing entries in waiting lists')
    .addTag('search', 'Search operations for waiting list entries')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the application
  await app.listen(3000);
}

void bootstrap();
