import { TaskStatus, type Task as PrismaTask } from '@prisma/client';
import type { Task } from '../schemas/task.schema';

/**
 * TaskEntity is the domain serialization layer between the Prisma model and
 * the API response shape.
 *
 * Prisma identifiers cannot contain hyphens, so the DB stores `in_progress`
 * while the API exposes `"in-progress"`. Both conversion directions live here
 * as static methods — this is the single source of truth for that mapping.
 */
export class TaskEntity {
  constructor(private readonly data: PrismaTask) {}

  toJSON(): Task {
    return {
      id: this.data.id,
      title: this.data.title,
      description: this.data.description ?? undefined,
      status: TaskEntity.toApiStatus(this.data.status),
      priority: this.data.priority as Task['priority'],
      projectId: this.data.projectId,
      createdAt: this.data.createdAt.toISOString(),
      updatedAt: this.data.updatedAt.toISOString(),
    };
  }

  // ── Static conversion helpers (read + write paths) ───────────────────────

  /** DB/Prisma → API: converts `in_progress` → `"in-progress"`. */
  static toApiStatus(status: TaskStatus): Task['status'] {
    if (status === TaskStatus.in_progress) return 'in-progress';
    return status as Task['status'];
  }

  /** API → DB/Prisma: converts `"in-progress"` → `TaskStatus.in_progress`. */
  static toPrismaStatus(apiStatus: string): TaskStatus {
    if (apiStatus === 'in-progress') return TaskStatus.in_progress;
    return apiStatus as TaskStatus;
  }
}
