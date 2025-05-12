import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Name of the task',
    minLength: 3,
    maxLength: 100,
    example: 'Complete Project Documentation',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message:
      'Task name can only contain letters, numbers, spaces, hyphens and underscores',
  })
  name: string;

  @ApiProperty({
    description: 'Due date of the task in YYYY-MM-DD format',
    example: '2024-05-20',
  })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    description: 'Status of the task',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Priority of the task',
    enum: TaskPriority,
    default: TaskPriority.BLUE,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Whether the task is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
