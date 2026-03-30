import { Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime class import for injection token
import { PrismaService } from '../prisma/prisma.service';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import type { Task } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Task[]> {
    const rows = await this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => new TaskEntity(row).toJSON());
  }

  async findOne(id: string): Promise<Task> {
    const row = await this.findOneOrThrow(id);
    return new TaskEntity(row).toJSON();
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    const row = await this.prisma.task.create({
      data: {
        ...dto,
        status: TaskEntity.toPrismaStatus(dto.status),
      },
    });
    return new TaskEntity(row).toJSON();
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    await this.findOneOrThrow(id);
    const row = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status !== undefined ? TaskEntity.toPrismaStatus(dto.status) : undefined,
      },
    });
    return new TaskEntity(row).toJSON();
  }

  async remove(id: string): Promise<void> {
    await this.findOneOrThrow(id);
    await this.prisma.task.delete({ where: { id } });
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async findOneOrThrow(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    return task;
  }
}
