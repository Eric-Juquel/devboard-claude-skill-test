import { faker } from '@faker-js/faker';
import type { Task } from '../../src/tasks/schemas/task.schema';

// Fixed seed ensures deterministic output across test runs
faker.seed(43);

/**
 * TaskBuilder — generates realistic, type-safe Task fixtures.
 *
 * Usage:
 *   TaskBuilder.create()                             // random task
 *   TaskBuilder.create({ status: 'in-progress' })    // override specific fields
 *   TaskBuilder.createMany(10)                       // array of 10 random tasks
 *   TaskBuilder.createMany(5, { projectId: 'uuid' }) // all linked to same project
 */
export class TaskBuilder {
  static create(overrides: Partial<Task> = {}): Task {
    return {
      id: faker.string.uuid(),
      title: faker.hacker.phrase().slice(0, 60),
      description: faker.datatype.boolean({ probability: 0.6 })
        ? faker.lorem.sentence()
        : undefined,
      status: faker.helpers.arrayElement(['todo', 'in-progress', 'done'] as const),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high'] as const),
      projectId: faker.string.uuid(),
      createdAt: faker.date.recent({ days: 90 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
      ...overrides,
    };
  }

  static createMany(size = 5, overrides: Partial<Task> = {}): Task[] {
    return Array.from({ length: size }, () => this.create(overrides));
  }
}
