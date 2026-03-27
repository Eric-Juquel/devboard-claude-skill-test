import type { Project as PrismaProject } from '@prisma/client';
import type { Project } from '../schemas/project.schema';

/**
 * ProjectEntity is the domain serialization layer between the Prisma model
 * (raw DB record) and the API response shape (defined by the Zod schema).
 *
 * Responsibilities:
 * - Convert Date objects → ISO 8601 strings
 * - Convert null → undefined for optional fields
 * - Map Prisma enum values → API string values (if needed)
 *
 * The service stays a lean orchestrator: it calls Prisma, wraps the result
 * in an Entity, and calls toJSON() to get the serialized API response.
 */
export class ProjectEntity {
  constructor(private readonly data: PrismaProject) {}

  toJSON(): Project {
    return {
      id: this.data.id,
      name: this.data.name,
      description: this.data.description ?? undefined,
      status: this.data.status as Project['status'],
      createdAt: this.data.createdAt.toISOString(),
      updatedAt: this.data.updatedAt.toISOString(),
    };
  }
}
