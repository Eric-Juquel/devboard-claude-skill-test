import { Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime class import for injection token
import { PrismaService } from '../prisma/prisma.service';
import { TaskEntity } from '../tasks/entities/task.entity';
import type { Task } from '../tasks/schemas/task.schema';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entities/project.entity';
import type { Project } from './schemas/project.schema';

/**
 * ProjectsService — pure orchestration layer.
 *
 * Each method:
 *  1. Calls Prisma (data access)
 *  2. Wraps the result in ProjectEntity
 *  3. Returns .toJSON() — the serialized API shape
 *
 * No transformation logic lives here — that belongs to ProjectEntity.
 */
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => new ProjectEntity(row).toJSON());
  }

  async findOne(id: string): Promise<Project> {
    const row = await this.findOneOrThrow(id);
    return new ProjectEntity(row).toJSON();
  }

  async findTasks(projectId: string): Promise<Task[]> {
    await this.findOneOrThrow(projectId);
    const rows = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => new TaskEntity(row).toJSON());
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    const row = await this.prisma.project.create({ data: dto });
    return new ProjectEntity(row).toJSON();
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    await this.findOneOrThrow(id);
    const row = await this.prisma.project.update({ where: { id }, data: dto });
    return new ProjectEntity(row).toJSON();
  }

  async remove(id: string): Promise<void> {
    await this.findOneOrThrow(id);
    await this.prisma.project.delete({ where: { id } });
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async findOneOrThrow(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }
    return project;
  }
}
