import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { TaskResponseDto } from '../tasks/dto/task-response.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime class import for injection token
import { ProjectsService } from './projects.service';

const TASK_EXAMPLE = {
  id: 'b0000000-0000-0000-0000-000000000001',
  title: 'Setup CI/CD pipeline',
  status: 'done',
  priority: 'high',
  projectId: 'a0000000-0000-0000-0000-000000000001',
  createdAt: '2026-01-16T10:00:00.000Z',
};

// Swagger example for a project response
const PROJECT_EXAMPLE = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'DevBoard Core',
  description: 'Main tracking application',
  status: 'active',
  createdAt: '2026-01-15T10:00:00.000Z',
};

const ERROR_EXAMPLE_404 = {
  statusCode: 404,
  message: 'Project with id "abc" not found',
  error: 'NOT_FOUND',
  path: '/projects/abc',
  timestamp: '2026-03-26T12:00:00.000Z',
};

const ERROR_EXAMPLE_400 = {
  statusCode: 400,
  message: ['name: String must contain at least 2 character(s)'],
  error: 'BAD_REQUEST',
  path: '/projects',
  timestamp: '2026-03-26T12:00:00.000Z',
};

@ApiTags('Projects')
@ApiExtraModels(CreateProjectDto, UpdateProjectDto, ProjectResponseDto, TaskResponseDto)
@ApiTooManyRequestsResponse({ description: 'Too many requests — rate limit exceeded' })
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({
    operationId: 'getProjects',
    summary: 'List all projects',
    description: 'Returns all projects ordered by creation date (newest first).',
  })
  @ApiOkResponse({
    description: 'Array of projects',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(ProjectResponseDto) },
      example: [PROJECT_EXAMPLE],
    },
  })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getProjectById', summary: 'Get a project by ID' })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    format: 'uuid',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  @ApiOkResponse({
    description: 'Project found',
    schema: { example: PROJECT_EXAMPLE },
  })
  @ApiNotFoundResponse({
    description: 'Project not found',
    schema: { example: ERROR_EXAMPLE_404 },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/tasks')
  @ApiOperation({
    operationId: 'getProjectTasks',
    summary: 'List tasks for a project',
    description: 'Returns all tasks belonging to the project, ordered by creation date (newest first).',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    format: 'uuid',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  @ApiOkResponse({
    description: 'Array of tasks',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(TaskResponseDto) },
      example: [TASK_EXAMPLE],
    },
  })
  @ApiNotFoundResponse({
    description: 'Project not found',
    schema: { example: ERROR_EXAMPLE_404 },
  })
  findTasks(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findTasks(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'createProject',
    summary: 'Create a project',
    description: 'Creates a new project. `status` defaults to `active` if omitted.',
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    schema: { example: PROJECT_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error — check `message` for details',
    schema: { example: ERROR_EXAMPLE_400 },
  })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'updateProject',
    summary: 'Update a project',
    description: 'Partial update — only send the fields you want to change.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    format: 'uuid',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  @ApiOkResponse({
    description: 'Updated project',
    schema: { example: { ...PROJECT_EXAMPLE, name: 'DevBoard Core v2' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid UUID',
    schema: { example: ERROR_EXAMPLE_400 },
  })
  @ApiNotFoundResponse({
    description: 'Project not found',
    schema: { example: ERROR_EXAMPLE_404 },
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteProject',
    summary: 'Delete a project',
    description: 'Deletes a project and all its associated tasks (cascade).',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    format: 'uuid',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  @ApiResponse({ status: 204, description: 'Project deleted — no content returned' })
  @ApiNotFoundResponse({
    description: 'Project not found',
    schema: { example: ERROR_EXAMPLE_404 },
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }
}
