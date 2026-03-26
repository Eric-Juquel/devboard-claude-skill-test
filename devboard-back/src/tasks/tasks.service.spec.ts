import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskBuilder } from '../../test/builders/task.builder';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';

const mockPrisma = {
  task: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

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
    description: 'A task description',
    status: 'todo',
    priority: 'medium',
    projectId: '11111111-1111-1111-1111-111111111111',
    createdAt: new Date('2026-01-16T10:00:00Z'),
    updatedAt: new Date('2026-01-16T10:00:00Z'),
    ...overrides,
  };
}

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<TasksService>(TasksService);
    vi.clearAllMocks();
  });

  // ── findAll ──────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('returns an empty array when no tasks exist', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });

    it('serializes tasks (ISO dates, undefined for null description)', async () => {
      const raw = rawTask({ description: null });
      mockPrisma.task.findMany.mockResolvedValue([raw]);

      const result = await service.findAll();

      expect(result[0]).toEqual({
        id: raw.id,
        title: raw.title,
        description: undefined,
        status: 'todo',
        priority: 'medium',
        projectId: raw.projectId,
        createdAt: '2026-01-16T10:00:00.000Z',
        updatedAt: '2026-01-16T10:00:00.000Z',
      });
    });

    it('maps in_progress (Prisma) → "in-progress" (API)', async () => {
      const raw = rawTask({ status: 'in_progress' });
      mockPrisma.task.findMany.mockResolvedValue([raw]);

      const result = await service.findAll();

      expect(result[0]?.status).toBe('in-progress');
    });

    it('uses TaskBuilder fixture for multi-task test', async () => {
      const tasks = TaskBuilder.createMany(4, { status: 'done' });
      const rawTasks = tasks.map((t) => ({
        ...t,
        status: 'done',
        description: t.description ?? null,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }));
      mockPrisma.task.findMany.mockResolvedValue(rawTasks);

      const result = await service.findAll();
      expect(result).toHaveLength(4);
      result.forEach((t) => {
        expect(t.status).toBe('done');
      });
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('returns the serialized task when found', async () => {
      const raw = rawTask();
      mockPrisma.task.findUnique.mockResolvedValue(raw);

      const result = await service.findOne(raw.id);

      expect(result.id).toBe(raw.id);
      expect(result.createdAt).toBe('2026-01-16T10:00:00.000Z');
    });

    it('throws NotFoundException when task does not exist', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('creates a task and maps "in-progress" to in_progress for Prisma', async () => {
      const dto: CreateTaskDto = {
        title: 'New Task',
        status: 'in-progress',
        priority: 'high',
        projectId: '11111111-1111-1111-1111-111111111111',
      };
      const raw = rawTask({ status: 'in_progress', priority: 'high', title: 'New Task' });
      mockPrisma.task.create.mockResolvedValue(raw);

      const result = await service.create(dto);

      // Prisma should have received in_progress (not in-progress)
      expect(mockPrisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'in_progress' }),
        }),
      );
      // API response should use in-progress
      expect(result.status).toBe('in-progress');
    });
  });

  // ── update ───────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('updates and returns the serialized task', async () => {
      const raw = rawTask();
      mockPrisma.task.findUnique.mockResolvedValue(raw);
      mockPrisma.task.update.mockResolvedValue({ ...raw, title: 'Updated Title' });

      const result = await service.update(raw.id, { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });

    it('throws NotFoundException when task does not exist', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', { title: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('deletes the task', async () => {
      const raw = rawTask();
      mockPrisma.task.findUnique.mockResolvedValue(raw);
      mockPrisma.task.delete.mockResolvedValue(raw);

      await service.remove(raw.id);

      expect(mockPrisma.task.delete).toHaveBeenCalledWith({ where: { id: raw.id } });
    });

    it('throws NotFoundException when task does not exist', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
