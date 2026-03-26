import { createZodDto } from 'nestjs-zod';
import { createProjectSchema } from '../schemas/project.schema';

/**
 * DTO derived from the Zod schema via nestjs-zod.
 *
 * createZodDto() generates a NestJS-compatible class that:
 *  - Is validated automatically by ZodValidationPipe (registered globally in AppModule)
 *  - Contributes its OpenAPI schema to Swagger (via patchNestJsSwagger in main.ts)
 *  - Provides full TypeScript types inferred from the Zod schema
 *
 * No class-validator decorators needed — the Zod schema IS the single source of truth.
 */
export class CreateProjectDto extends createZodDto(createProjectSchema) {}
