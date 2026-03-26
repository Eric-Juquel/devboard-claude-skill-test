import { createZodDto } from 'nestjs-zod';
import { projectSchema } from '../schemas/project.schema';

export class ProjectResponseDto extends createZodDto(projectSchema) {}
