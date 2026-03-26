/**
 * Standalone script — generates openapi.yaml from the NestJS app.
 *
 * Usage: pnpm openapi:export
 *
 * The script bootstraps the app without listening on a port,
 * generates the OpenAPI document, and writes it to openapi.yaml
 * at the project root.
 *
 * Run this whenever the API changes and commit openapi.yaml so that
 * frontend teams and API consumers always have an up-to-date spec
 * without needing to start the server.
 */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { patchNestJsSwagger } from 'nestjs-zod';
import { resolve } from 'path';
import { AppModule } from '../src/app.module';

async function exportOpenApi() {
  // Must be called before SwaggerModule.createDocument()
  patchNestJsSwagger();

  const app = await NestFactory.create(AppModule, {
    // Silence all NestJS logs — this is a one-shot CLI script
    logger: false,
  });

  const config = new DocumentBuilder()
    .setTitle('DevBoard API')
    .setDescription(
      'RESTful API for managing development projects and tasks.\n\n' +
        'All endpoints return JSON. Dates are ISO 8601 strings.\n\n' +
        'Error responses always follow the shape:\n' +
        '`{ statusCode, message, error, path, timestamp }`',
    )
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local development')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outputPath = resolve(process.cwd(), 'openapi.yaml');
  writeFileSync(outputPath, yaml.dump(document, { noRefs: true, lineWidth: 120 }));

  await app.close();

  console.log(`✅ openapi.yaml written to ${outputPath}`);
}

exportOpenApi().catch((err) => {
  console.error('Failed to export OpenAPI spec:', err);
  process.exit(1);
});
