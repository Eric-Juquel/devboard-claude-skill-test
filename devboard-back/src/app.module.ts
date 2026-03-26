import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { ZodValidationPipe } from 'nestjs-zod';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    // Configuration — loaded globally, validated at startup via Joi schema.
    // The app will refuse to start if required env vars are missing or invalid.
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
        THROTTLE_TTL: Joi.number().default(60000),
        THROTTLE_LIMIT: Joi.number().default(100),
      }),
    }),

    // Rate limiting — configured from env vars via async factory
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60000),
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // Global Prisma database module
    PrismaModule,

    // Feature modules
    ProjectsModule,
    TasksModule,

    // Health check endpoint (/health)
    HealthModule,
  ],
  providers: [
    // ThrottlerGuard registered globally as APP_GUARD.
    // All routes are rate-limited by the ThrottlerModule configuration above.
    // Use @SkipThrottle() on individual routes/controllers to opt out.
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // ZodValidationPipe registered globally as APP_PIPE.
    // This means all controllers automatically validate their @Body() DTOs
    // via the Zod schema they are created from (using nestjs-zod's createZodDto).
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
