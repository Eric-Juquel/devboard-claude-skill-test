import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import * as request from 'supertest';
import { ZodValidationPipe, patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let projectId: string;

  beforeAll(async () => {
    patchNestJsSwagger();

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    // Each test gets a fresh project to link tasks to
    const project = await prisma.project.create({ data: { name: 'Test Project', status: 'active' } });
    projectId = project.id;
  });

  // ── POST /tasks ───────────────────────────────────────────────────────────

  describe('POST /tasks', () => {
    it('creates a task and returns 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'New Task', projectId, status: 'todo', priority: 'medium' })
        .expect(201);

      expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(res.body.title).toBe('New Task');
      expect(res.body.status).toBe('todo');
      expect(res.body.projectId).toBe(projectId);
      expect(res.body.updatedAt).toBeTruthy();
    });

    it('correctly stores and returns "in-progress" status', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'In Progress Task', projectId, status: 'in-progress', priority: 'high' })
        .expect(201);

      expect(res.body.status).toBe('in-progress');

      // Verify the DB stored in_progress (Prisma enum value)
      const dbTask = await prisma.task.findUnique({ where: { id: res.body.id } });
      expect(dbTask?.status).toBe('in_progress');
    });

    it('defaults status to "todo" and priority to "medium" when omitted', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Minimal Task', projectId })
        .expect(201);

      expect(res.body.status).toBe('todo');
      expect(res.body.priority).toBe('medium');
    });

    it('returns 400 when title is too short', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'X', projectId })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('returns 400 when projectId is not a UUID', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Bad Project', projectId: 'not-a-uuid' })
        .expect(400);
    });

    it('returns 400 for invalid status value', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Bad Status', projectId, status: 'invalid' })
        .expect(400);
    });
  });

  // ── GET /tasks ────────────────────────────────────────────────────────────

  describe('GET /tasks', () => {
    it('returns an empty array when no tasks exist', async () => {
      const res = await request(app.getHttpServer()).get('/tasks').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('returns all tasks and maps in_progress → "in-progress"', async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Task A', status: 'todo', priority: 'low', projectId },
          { title: 'Task B', status: 'in_progress', priority: 'medium', projectId },
          { title: 'Task C', status: 'done', priority: 'high', projectId },
        ],
      });

      const res = await request(app.getHttpServer()).get('/tasks').expect(200);
      expect(res.body).toHaveLength(3);

      const inProgress = res.body.find((t: { status: string }) => t.status === 'in-progress');
      expect(inProgress).toBeTruthy();
    });
  });

  // ── GET /tasks/:id ────────────────────────────────────────────────────────

  describe('GET /tasks/:id', () => {
    it('returns a task by ID', async () => {
      const task = await prisma.task.create({
        data: { title: 'Find Me', status: 'todo', priority: 'low', projectId },
      });

      const res = await request(app.getHttpServer()).get(`/tasks/${task.id}`).expect(200);

      expect(res.body.id).toBe(task.id);
      expect(res.body.title).toBe('Find Me');
    });

    it('returns 404 when task does not exist', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('returns 400 for non-UUID id', async () => {
      await request(app.getHttpServer()).get('/tasks/not-a-uuid').expect(400);
    });
  });

  // ── PATCH /tasks/:id ──────────────────────────────────────────────────────

  describe('PATCH /tasks/:id', () => {
    it('updates a task and returns 200', async () => {
      const task = await prisma.task.create({
        data: { title: 'Original', status: 'todo', priority: 'low', projectId },
      });

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send({ status: 'in-progress', priority: 'high' })
        .expect(200);

      expect(res.body.status).toBe('in-progress');
      expect(res.body.priority).toBe('high');
    });

    it('returns 404 when task does not exist', async () => {
      const res = await request(app.getHttpServer())
        .patch('/tasks/00000000-0000-0000-0000-000000000000')
        .send({ title: 'Ghost' })
        .expect(404);

      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('returns 400 for non-UUID id', async () => {
      await request(app.getHttpServer())
        .patch('/tasks/not-a-uuid')
        .send({ title: 'Test' })
        .expect(400);
    });
  });

  // ── DELETE /tasks/:id ─────────────────────────────────────────────────────

  describe('DELETE /tasks/:id', () => {
    it('deletes a task and returns 204', async () => {
      const task = await prisma.task.create({
        data: { title: 'To Delete', status: 'todo', priority: 'low', projectId },
      });

      await request(app.getHttpServer()).delete(`/tasks/${task.id}`).expect(204);

      const deleted = await prisma.task.findUnique({ where: { id: task.id } });
      expect(deleted).toBeNull();
    });

    it('returns 404 when task does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/tasks/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
