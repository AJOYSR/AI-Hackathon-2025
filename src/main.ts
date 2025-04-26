import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExcludeEmbeddingInterceptor } from './common/pipes/exclude-embedding.pipe';
import { SwaggerConfig } from './internal/swagger.init';
import { connect as connectToDatabase } from './internal/connect-to-db';
import { I18nService } from 'nestjs-i18n';
import { AllExceptionsFilter } from './internal/exception/all-exception-filter';
import { coreConfig } from './config/core';
import { ValidationPipe } from './decorators/validation.pipe';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // Connect to the database
  await connectToDatabase();

  // Create a new Nest application instance
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files
  app.useStaticAssets(path.join(__dirname, '..', 'public'), {
    prefix: '/public',
  });

  // Set the global prefix for all routes
  app.setGlobalPrefix(coreConfig.apiPrefix);

  // Enable CORS with more permissive configuration for development
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  // Global interceptor to exclude embedding field
  app.useGlobalInterceptors(new ExcludeEmbeddingInterceptor());

  // Swagger setup
  SwaggerConfig(app);

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AI Search API')
    .setDescription('AI-powered search pipeline with intent classification, ranking, and guardrails')
    .setVersion('1.0')
    .addTag('Search')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Initialize I18nModule and inject I18nService into AllExceptionsFilter
  const i18nService =
    app.get<I18nService<Record<string, unknown>>>(I18nService);
  app.useGlobalFilters(new AllExceptionsFilter(i18nService));

  // Use global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 4040;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
