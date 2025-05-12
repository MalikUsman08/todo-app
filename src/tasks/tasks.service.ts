import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

interface PostgresError extends Error {
  code?: string;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    try {
      const task = this.tasksRepository.create(createTaskDto);
      return await this.tasksRepository.save(task);
    } catch (error) {
      const pgError = error as PostgresError;
      if (pgError.code === '23505') {
        // Unique violation
        throw new BadRequestException('A task with this name already exists');
      }
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: {
      status?: TaskStatus;
      priority?: TaskPriority;
      isActive?: boolean;
      startDate?: string;
      endDate?: string;
      search?: string;
    },
  ) {
    if (page < 1)
      throw new BadRequestException('Page number must be greater than 0');
    if (limit < 1 || limit > 100)
      throw new BadRequestException('Limit must be between 1 and 100');

    const queryBuilder = this.tasksRepository.createQueryBuilder('task');

    if (filters) {
      if (filters.status) {
        queryBuilder.andWhere('task.status = :status', {
          status: filters.status,
        });
      }
      if (filters.priority) {
        queryBuilder.andWhere('task.priority = :priority', {
          priority: filters.priority,
        });
      }
      if (filters.isActive !== undefined) {
        queryBuilder.andWhere('task.isActive = :isActive', {
          isActive: filters.isActive,
        });
      }
      if (filters.startDate && filters.endDate) {
        queryBuilder.andWhere('task.dueDate BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      } else if (filters.startDate) {
        queryBuilder.andWhere('task.dueDate >= :startDate', {
          startDate: filters.startDate,
        });
      } else if (filters.endDate) {
        queryBuilder.andWhere('task.dueDate <= :endDate', {
          endDate: filters.endDate,
        });
      }
      if (filters.search) {
        queryBuilder.andWhere('task.name ILIKE :search', {
          search: `%${filters.search}%`,
        });
      }
    }

    const [tasks, total] = await queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    if (!id || id < 1) {
      throw new BadRequestException('Invalid task ID');
    }

    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    if (!id || id < 1) {
      throw new BadRequestException('Invalid task ID');
    }

    const task = await this.findOne(id);

    // Validate status transitions
    if (updateTaskDto.status && task.status !== updateTaskDto.status) {
      if (
        task.status === TaskStatus.DONE &&
        updateTaskDto.status !== TaskStatus.DONE
      ) {
        throw new BadRequestException(
          'Cannot change status of a completed task',
        );
      }
    }

    try {
      Object.assign(task, updateTaskDto);
      return await this.tasksRepository.save(task);
    } catch (error) {
      const pgError = error as PostgresError;
      if (pgError.code === '23505') {
        // Unique violation
        throw new BadRequestException('A task with this name already exists');
      }
      throw error;
    }
  }

  async softDelete(id: number) {
    if (!id || id < 1) {
      throw new BadRequestException('Invalid task ID');
    }

    const task = await this.findOne(id);

    // Soft delete by setting isActive to false
    task.isActive = false;
    return await this.tasksRepository.save(task);
  }

  async hardDelete(id: number) {
    if (!id || id < 1) {
      throw new BadRequestException('Invalid task ID');
    }

    // Delete the task from the database
    const result = await this.tasksRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return { message: 'Task permanently deleted' };
  }

  // Default delete operation (soft delete)
  async remove(id: number) {
    return this.softDelete(id);
  }
}
