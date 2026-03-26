import type { Task as PrismaTask } from '@prisma/client';
import type { Task } from '../schemas/task.schema';

/**
 * TaskEntity is the domain serialization layer between the Prisma model and
 * the API response shape.
 *
 * Critical mapping: Prisma cannot store enum values with hyphens, so the DB
 * stores `in_progress` while the API exposes `"in-progress"`.
 * toJSON() is the SINGLE place where this translation happens — never anywhere else.
 */
export class TaskEntity {
  constructor(private readonly data: PrismaTask) {}

  toJSON(): Task {
    return {
      id: this.data.id,
      title: this.data.title,
      description: this.data.description ?? undefined,
      status: this.mapStatus(this.data.status),
      priority: this.data.priority as Task['priority'],
      projectId: this.data.projectId,
      createdAt: this.data.createdAt.toISOString(),
      updatedAt: this.data.updatedAt.toISOString(),
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private mapStatus(prismaStatus: string): Task['status'] {
    if (prismaStatus === 'in_progress') return 'in-progress';
    return prismaStatus as Task['status'];
  }
}
