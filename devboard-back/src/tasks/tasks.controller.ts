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
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime class import for injection token
import { TasksService } from './tasks.service';

const TASK_EXAMPLE = {
  id: 'b0000000-0000-0000-0000-000000000001',
  title: 'Setup CI/CD pipeline',
  description: 'Configure GitHub Actions for automated testing and deployment',
  status: 'done',
  priority: 'high',
  projectId: 'a0000000-0000-0000-0000-000000000001',
  createdAt: '2026-01-16T10:00:00.000Z',
};

const ERROR_EXAMPLE_404 = {
  statusCode: 404,
  message: 'Task with id "abc" not found',
  error: 'NOT_FOUND',
  path: '/tasks/abc',
  timestamp: '2026-03-26T12:00:00.000Z',
};

const ERROR_EXAMPLE_400 = {
  statusCode: 400,
  message: ['title: String must contain at least 2 character(s)'],
  error: 'BAD_REQUEST',
  path: '/tasks',
  timestamp: '2026-03-26T12:00:00.000Z',
};

@ApiTags('Tasks')
@ApiExtraModels(CreateTaskDto, UpdateTaskDto, TaskResponseDto)
@ApiTooManyRequestsResponse({ description: 'Too many requests — rate limit exceeded' })
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({
    operationId: 'getTasks',
    summary: 'List all tasks',
    description: 'Returns all tasks ordered by creation date (newest first).',
  })
  @ApiOkResponse({
    description: 'Array of tasks',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(TaskResponseDto) },
      example: [TASK_EXAMPLE],
    },
  })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getTaskById', summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task UUID', format: 'uuid', example: 'b0000000-0000-0000-0000-000000000001' })
  @ApiOkResponse({
    description: 'Task found',
    type: TaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Task not found',
    schema: { example: ERROR_EXAMPLE_404 },
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'createTask',
    summary: 'Create a task',
    description:
      'Creates a new task linked to a project.\n\n' +
      '`status` defaults to `todo`, `priority` defaults to `medium`.\n\n' +
      'Note: `status` uses `"in-progress"` (with a hyphen) as the API value.',
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error — check `message` for details',
    schema: { example: ERROR_EXAMPLE_400 },
  })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'updateTask',
    summary: 'Update a task',
    description: 'Partial update — only send the fields you want to change.',
  })
  @ApiParam({ name: 'id', description: 'Task UUID', format: 'uuid', example: 'b0000000-0000-0000-0000-000000000001' })
  @ApiOkResponse({
    description: 'Updated task',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid UUID',
    schema: { example: ERROR_EXAMPLE_400 },
  })
  @ApiNotFoundResponse({
    description: 'Task not found',
    schema: { example: ERROR_EXAMPLE_404 },
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'deleteTask',
    summary: 'Delete a task',
    description: 'Permanently deletes a task.',
  })
  @ApiParam({ name: 'id', description: 'Task UUID', format: 'uuid', example: 'b0000000-0000-0000-0000-000000000001' })
  @ApiResponse({ status: 204, description: 'Task deleted — no content returned' })
  @ApiNotFoundResponse({
    description: 'Task not found',
    schema: { example: ERROR_EXAMPLE_404 },
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
