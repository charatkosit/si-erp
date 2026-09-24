import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('SI Warehouse API').setVersion('v1').build());
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.API_PORT ?? 3000);
}
bootstrap();
