import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { PaginatedTasksDto } from './dto/paginated-tasks.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new task',
    description:
      'Creates a new task with the provided details. Name and due date are required fields.\n\n- status: Only accepts one of: pending, done, in_progress, paused.\n- priority: Only accepts one of: red, yellow, blue.\n- isActive: true or false.',
  })
  @ApiBody({
    type: CreateTaskDto,
    description:
      'Task creation data.\n\n- name: string (min 3, max 100 characters, required)\n- dueDate: string (YYYY-MM-DD, required)\n- status: pending | done | in_progress | paused (optional, default: pending)\n- priority: red | yellow | blue (optional, default: blue)\n- isActive: boolean (optional, default: true)',
    examples: {
      example1: {
        summary: 'Create a high priority task',
        value: {
          name: 'Complete Project Documentation',
          dueDate: '2024-05-20',
          status: 'pending',
          priority: 'red',
          isActive: true,
        },
      },
      example2: {
        summary: 'Create a low priority task',
        value: {
          name: 'Read a book',
          dueDate: '2024-06-01',
          status: 'in_progress',
          priority: 'blue',
          isActive: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: Task,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or task name already exists',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        errors: [
          {
            property: 'name',
            constraints: {
              minLength: 'name must be longer than or equal to 3 characters',
            },
          },
        ],
      },
    },
  })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks with pagination and filters',
    description:
      'Retrieves a paginated list of tasks with optional filtering.\n\nQuery Parameters:\n- page: number (default: 1, min: 1)\n- limit: number (default: 10, min: 1, max: 100)\n- status: pending | done | in_progress | paused\n- priority: red | yellow | blue\n- isActive: true | false\n- startDate: string (YYYY-MM-DD)\n- endDate: string (YYYY-MM-DD)\n- search: string (searches in task names, case-insensitive)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1, min: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, min: 1, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    description:
      'Filter by task status. Allowed values: pending, done, in_progress, paused',
    example: TaskStatus.PENDING,
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: TaskPriority,
    description: 'Filter by task priority. Allowed values: red, yellow, blue',
    example: TaskPriority.RED,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status. Allowed values: true, false',
    example: true,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter by start date (YYYY-MM-DD)',
    example: '2024-05-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2024-05-31',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in task names (case-insensitive)',
    example: 'project',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all tasks with pagination metadata',
    type: PaginatedTasksDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
    schema: {
      example: {
        statusCode: 400,
        message: 'Page number must be greater than 0',
      },
    },
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('isActive') isActive?: boolean,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.tasksService.findAll(page, limit, {
      status,
      priority,
      isActive,
      startDate,
      endDate,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a task by id',
    description:
      'Retrieves a single task by its ID.\n\n- id: integer (required, must exist in database)',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Task ID (integer, required)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Return the task',
    type: Task,
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Task with ID 999 not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid task ID',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid task ID',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a task',
    description:
      'Updates an existing task. Cannot change status of completed tasks.\n\n- id: integer (required)\n- name: string (min 3, max 100 characters)\n- dueDate: string (YYYY-MM-DD)\n- status: pending | done | in_progress | paused\n- priority: red | yellow | blue\n- isActive: true | false',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Task ID (integer, required)',
    example: 1,
  })
  @ApiBody({
    type: UpdateTaskDto,
    description:
      'Task update data.\n\n- name: string (min 3, max 100 characters)\n- dueDate: string (YYYY-MM-DD)\n- status: pending | done | in_progress | paused\n- priority: red | yellow | blue\n- isActive: boolean',
    examples: {
      example1: {
        summary: 'Update task status',
        value: {
          status: 'in_progress',
        },
      },
      example2: {
        summary: 'Update multiple fields',
        value: {
          name: 'Updated Task Name',
          priority: 'yellow',
          status: 'in_progress',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: Task,
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Task with ID 999 not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or cannot update completed task',
    schema: {
      example: {
        statusCode: 400,
        message: 'Cannot change status of a completed task',
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete a task',
    description:
      'Marks a task as inactive by setting isActive to false. The task remains in the database but is hidden from normal queries.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Task ID (integer, required)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The task has been soft deleted (marked as inactive)',
    type: Task,
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Task with ID 999 not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid task ID',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid task ID',
      },
    },
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.softDelete(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({
    summary: 'Permanently delete a task',
    description:
      'Completely removes a task from the database. This operation cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Task ID (integer, required)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The task has been permanently deleted from the database',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Task permanently deleted',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Task with ID 999 not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid task ID',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid task ID',
      },
    },
  })
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.hardDelete(id);
  }
}
