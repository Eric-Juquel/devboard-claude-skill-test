import { faker } from '@faker-js/faker';
import type { Project } from '../../src/projects/schemas/project.schema';

// Fixed seed ensures deterministic output across test runs
faker.seed(42);

/**
 * ProjectBuilder — generates realistic, type-safe Project fixtures.
 *
 * Usage:
 *   ProjectBuilder.create()                    // random project
 *   ProjectBuilder.create({ status: 'done' })  // override specific fields
 *   ProjectBuilder.createMany(5)               // array of 5 random projects
 *   ProjectBuilder.createMany(3, { status: 'archived' }) // array with overrides
 */
export class ProjectBuilder {
  static create(overrides: Partial<Project> = {}): Project {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.datatype.boolean({ probability: 0.7 })
        ? faker.lorem.sentence()
        : undefined,
      status: faker.helpers.arrayElement(['active', 'completed', 'archived'] as const),
      createdAt: faker.date.recent({ days: 90 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
      ...overrides,
    };
  }

  static createMany(size = 5, overrides: Partial<Project> = {}): Project[] {
    return Array.from({ length: size }, () => this.create(overrides));
  }
}
