import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectBuilder } from '../../test/builders/project.builder';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

// Typed mock for the Prisma project and task operations
const mockPrisma = {
  project: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  task: {
    findMany: vi.fn(),
  },
};

// Helper to build a raw Prisma-style project (Date objects, not strings)
function rawProject(
  overrides: Partial<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Test Project',
    description: 'A description',
    status: 'active',
    createdAt: new Date('2026-01-15T10:00:00Z'),
    updatedAt: new Date('2026-01-15T10:00:00Z'),
    ...overrides,
  };
}

function rawTask(
  overrides: Partial<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) {
  return {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Test Task',
    description: null,
    status: 'todo',
    priority: 'medium',
    projectId: '11111111-1111-1111-1111-111111111111',
    createdAt: new Date('2026-01-16T10:00:00Z'),
    updatedAt: new Date('2026-01-16T10:00:00Z'),
    ...overrides,
  };
}

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    vi.clearAllMocks();
  });

  // ── findAll ──────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('returns an empty array when no projects exist', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });

    it('returns serialized projects (ISO dates, undefined for null description)', async () => {
      const raw = rawProject({ description: null });
      mockPrisma.project.findMany.mockResolvedValue([raw]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: raw.id,
        name: raw.name,
        description: undefined,
        status: 'active',
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-01-15T10:00:00.000Z',
      });
    });

    it('uses ProjectBuilder fixture for multi-project test', async () => {
      // ProjectBuilder generates valid API-shaped projects.
      // For the mock we need raw Prisma shape — convert accordingly.
      const projects = ProjectBuilder.createMany(3, { status: 'active' });
      const rawProjects = projects.map((p) => ({
        ...p,
        description: p.description ?? null,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
      mockPrisma.project.findMany.mockResolvedValue(rawProjects);

      const result = await service.findAll();
      expect(result).toHaveLength(3);
      result.forEach((p) => {
        expect(p.status).toBe('active');
      });
    });
  });

  // ── findTasks ─────────────────────────────────────────────────────────────

  describe('findTasks()', () => {
    it('returns serialized tasks for the project', async () => {
      const project = rawProject();
      mockPrisma.project.findUnique.mockResolvedValue(project);
      mockPrisma.task.findMany.mockResolvedValue([rawTask()]);

      const result = await service.findTasks(project.id);

      expect(result).toHaveLength(1);
      expect(result[0]?.projectId).toBe(project.id);
      expect(result[0]?.createdAt).toBe('2026-01-16T10:00:00.000Z');
    });

    it('returns empty array when project has no tasks', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(rawProject());
      mockPrisma.task.findMany.mockResolvedValue([]);

      const result = await service.findTasks('11111111-1111-1111-1111-111111111111');
      expect(result).toEqual([]);
    });

    it('throws NotFoundException when project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.findTasks('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('returns the serialized project when found', async () => {
      const raw = rawProject();
      mockPrisma.project.findUnique.mockResolvedValue(raw);

      const result = await service.findOne(raw.id);

      expect(result.id).toBe(raw.id);
      expect(result.createdAt).toBe('2026-01-15T10:00:00.000Z');
    });

    it('throws NotFoundException when project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('creates and returns the serialized project', async () => {
      const dto: CreateProjectDto = { name: 'New Project', status: 'active' };
      const raw = rawProject({ name: 'New Project' });
      mockPrisma.project.create.mockResolvedValue(raw);

      const result = await service.create(dto);

      expect(mockPrisma.project.create).toHaveBeenCalledWith({ data: dto });
      expect(result.name).toBe('New Project');
      expect(result.createdAt).toBe('2026-01-15T10:00:00.000Z');
    });
  });

  // ── update ───────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('updates and returns the serialized project', async () => {
      const raw = rawProject();
      mockPrisma.project.findUnique.mockResolvedValue(raw);
      mockPrisma.project.update.mockResolvedValue({ ...raw, name: 'Updated' });

      const dto: UpdateProjectDto = { name: 'Updated' };
      const result = await service.update(raw.id, dto);

      expect(result.name).toBe('Updated');
    });

    it('throws NotFoundException when project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('deletes the project', async () => {
      const raw = rawProject();
      mockPrisma.project.findUnique.mockResolvedValue(raw);
      mockPrisma.project.delete.mockResolvedValue(raw);

      await service.remove(raw.id);

      expect(mockPrisma.project.delete).toHaveBeenCalledWith({ where: { id: raw.id } });
    });

    it('throws NotFoundException when project does not exist', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
