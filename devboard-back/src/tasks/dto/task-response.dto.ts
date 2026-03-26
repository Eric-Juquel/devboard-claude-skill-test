import { createZodDto } from 'nestjs-zod';
import { taskSchema } from '../schemas/task.schema';

export class TaskResponseDto extends createZodDto(taskSchema) {}
