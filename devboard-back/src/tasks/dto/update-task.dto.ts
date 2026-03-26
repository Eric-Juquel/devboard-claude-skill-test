import { createZodDto } from 'nestjs-zod';
import { updateTaskSchema } from '../schemas/task.schema';

export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
