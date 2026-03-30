import { ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import { patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  // Must be called BEFORE SwaggerModule.createDocument() so that Zod schemas
  // are properly reflected into the OpenAPI spec.
  patchNestJsSwagger();

  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const config = app.get(ConfigService);
  const env = config.get<string>('NODE_ENV', 'development');

  // ── Structured logging ────────────────────────────────────────────────────
  // Use timestamped logger in production (no colors for log aggregators).
  // For structured JSON logging at scale, replace with nestjs-pino.
  if (env === 'production') {
    app.useLogger(new ConsoleLogger({ timestamp: true }));
  }

  // ── Security ──────────────────────────────────────────────────────────────
  // Limit request body size to prevent payload-based DoS attacks.
  // Using body-parser directly for Express 5 compatibility.
  app.use(bodyParser.json({ limit: '100kb' }));
  app.use(bodyParser.urlencoded({ limit: '100kb', extended: true }));

  // Helmet sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options,
  // Strict-Transport-Security, etc.) on every response.
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────────────────────
  // Only allow the origins listed in CORS_ORIGINS (comma-separated).
  // Never use wildcard '*' in production — that would bypass the CORS policy.
  const rawOrigins = config.get<string>('CORS_ORIGINS', 'http://localhost:5173');
  const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ── Global exception filter ───────────────────────────────────────────────
  // All unhandled exceptions are caught here and returned as a consistent JSON
  // error envelope. Stack traces are never exposed to the client.
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── OpenAPI / Swagger ─────────────────────────────────────────────────────
  // Available in all non-production environments at /docs.
  // nestjs-zod's patchNestJsSwagger() (called above) makes Zod-derived DTOs
  // automatically contribute their schemas to the generated OpenAPI document.
  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DevBoard API')
      .setDescription(
        'RESTful API for managing development projects and tasks.\n\n' +
          'All endpoints return JSON. Dates are ISO 8601 strings.\n\n' +
          'Error responses always follow the shape:\n' +
          '`{ statusCode, message, error, path, timestamp }`',
      )
      .setVersion('1.0')
      .setContact('DevBoard Team', '', '')
      .addServer(`http://localhost:${config.get<number>('PORT', 3000)}`, 'Local development')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        defaultModelsExpandDepth: 2,
        defaultResponseContentType: 'application/json',
      },
    });
  }

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);

  const frontendUrl = allowedOrigins[0];
  console.log(`\n🚀 DevBoard API running on http://localhost:${port}`);
  if (env !== 'production') {
    console.log(`📖 Swagger UI:          http://localhost:${port}/docs`);
    console.log(`📖 OpenAPI JSON:        http://localhost:${port}/docs-json`);
  }
  console.log(`🌐 Frontend:            ${frontendUrl}\n`);
}

bootstrap();
