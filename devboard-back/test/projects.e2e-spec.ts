import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { patchNestJsSwagger } from 'nestjs-zod';
import { ZodValidationPipe } from 'nestjs-zod';

describe('ProjectsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  // ── POST /projects ────────────────────────────────────────────────────────

  describe('POST /projects', () => {
    it('creates a project and returns 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'E2E Project', status: 'active' })
        .expect(201);

      expect(res.body.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(res.body.name).toBe('E2E Project');
      expect(res.body.status).toBe('active');
      expect(res.body.createdAt).toBeTruthy();
      expect(res.body.updatedAt).toBeTruthy();
    });

    it('defaults status to "active" when omitted', async () => {
      const res = await request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'No Status Project' })
        .expect(201);

      expect(res.body.status).toBe('active');
    });

    it('returns 400 when name is too short', async () => {
      const res = await request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'X' })
        .expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.error).toBe('BAD_REQUEST');
    });

    it('returns 400 for invalid status value', async () => {
      await request(app.getHttpServer())
        .post('/projects')
        .send({ name: 'Bad Status', status: 'invalid-status' })
        .expect(400);
    });
  });

  // ── GET /projects ─────────────────────────────────────────────────────────

  describe('GET /projects', () => {
    it('returns an empty array when no projects exist', async () => {
      const res = await request(app.getHttpServer()).get('/projects').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('returns all projects', async () => {
      await prisma.project.createMany({
        data: [
          { name: 'Project A', status: 'active' },
          { name: 'Project B', status: 'completed' },
        ],
      });

      const res = await request(app.getHttpServer()).get('/projects').expect(200);
      expect(res.body).toHaveLength(2);
    });
  });

  // ── GET /projects/:id ─────────────────────────────────────────────────────

  describe('GET /projects/:id', () => {
    it('returns a project by ID', async () => {
      const project = await prisma.project.create({ data: { name: 'Find Me', status: 'active' } });

      const res = await request(app.getHttpServer()).get(`/projects/${project.id}`).expect(200);

      expect(res.body.id).toBe(project.id);
      expect(res.body.name).toBe('Find Me');
    });

    it('returns 404 when project does not exist', async () => {
      const res = await request(app.getHttpServer())
        .get('/projects/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('returns 400 for non-UUID id', async () => {
      await request(app.getHttpServer()).get('/projects/not-a-uuid').expect(400);
    });
  });

  // ── GET /projects/:id/tasks ───────────────────────────────────────────────

  describe('GET /projects/:id/tasks', () => {
    it('returns tasks belonging to the project', async () => {
      const project = await prisma.project.create({ data: { name: 'With Tasks', status: 'active' } });
      await prisma.task.createMany({
        data: [
          { title: 'Task One', status: 'todo', priority: 'low', projectId: project.id },
          { title: 'Task Two', status: 'done', priority: 'high', projectId: project.id },
        ],
      });

      const res = await request(app.getHttpServer()).get(`/projects/${project.id}/tasks`).expect(200);

      expect(res.body).toHaveLength(2);
      res.body.forEach((t: { projectId: string }) => expect(t.projectId).toBe(project.id));
    });

    it('returns empty array when project has no tasks', async () => {
      const project = await prisma.project.create({ data: { name: 'Empty', status: 'active' } });

      const res = await request(app.getHttpServer()).get(`/projects/${project.id}/tasks`).expect(200);

      expect(res.body).toHaveLength(0);
    });

    it('returns 404 when project does not exist', async () => {
      await request(app.getHttpServer())
        .get('/projects/00000000-0000-0000-0000-000000000000/tasks')
        .expect(404);
    });
  });

  // ── PATCH /projects/:id ───────────────────────────────────────────────────

  describe('PATCH /projects/:id', () => {
    it('updates a project and returns 200', async () => {
      const project = await prisma.project.create({ data: { name: 'Original', status: 'active' } });

      const res = await request(app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .send({ name: 'Updated', status: 'completed' })
        .expect(200);

      expect(res.body.name).toBe('Updated');
      expect(res.body.status).toBe('completed');
    });

    it('returns 404 when project does not exist', async () => {
      const res = await request(app.getHttpServer())
        .patch('/projects/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Ghost' })
        .expect(404);

      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('returns 400 for non-UUID id', async () => {
      await request(app.getHttpServer())
        .patch('/projects/not-a-uuid')
        .send({ name: 'Test' })
        .expect(400);
    });
  });

  // ── DELETE /projects/:id ──────────────────────────────────────────────────

  describe('DELETE /projects/:id', () => {
    it('deletes a project and returns 204', async () => {
      const project = await prisma.project.create({ data: { name: 'To Delete', status: 'active' } });

      await request(app.getHttpServer()).delete(`/projects/${project.id}`).expect(204);

      const deleted = await prisma.project.findUnique({ where: { id: project.id } });
      expect(deleted).toBeNull();
    });

    it('also deletes associated tasks (cascade)', async () => {
      const project = await prisma.project.create({ data: { name: 'With Tasks', status: 'active' } });
      await prisma.task.create({
        data: { title: 'Orphan Task', status: 'todo', priority: 'low', projectId: project.id },
      });

      await request(app.getHttpServer()).delete(`/projects/${project.id}`).expect(204);

      const tasks = await prisma.task.findMany({ where: { projectId: project.id } });
      expect(tasks).toHaveLength(0);
    });

    it('returns 404 when project does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/projects/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});
