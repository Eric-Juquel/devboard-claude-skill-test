import { createZodDto } from 'nestjs-zod';
import { createTaskSchema } from '../schemas/task.schema';

export class CreateTaskDto extends createZodDto(createTaskSchema) {}
