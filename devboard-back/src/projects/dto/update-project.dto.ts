import { createZodDto } from 'nestjs-zod';
import { updateProjectSchema } from '../schemas/project.schema';

/**
 * All fields are optional (updateProjectSchema uses .partial()).
 * Allows partial updates — only send the fields you want to change.
 */
export class UpdateProjectDto extends createZodDto(updateProjectSchema) {}
