import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
  PENDING = 'pending',
  DONE = 'done',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
}

export enum TaskPriority {
  RED = 'red',
  YELLOW = 'yellow',
  BLUE = 'blue',
}

@Entity('tasks')
export class Task {
  @ApiProperty({
    description: 'Unique identifier of the task',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Name of the task',
    example: 'Complete Project Documentation',
    minLength: 3,
    maxLength: 100,
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Due date of the task in YYYY-MM-DD format',
    example: '2024-05-20',
  })
  @Column({ type: 'date' })
  dueDate: string;

  @ApiProperty({
    description: 'Current status of the task',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
    default: TaskStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Priority level of the task',
    enum: TaskPriority,
    example: TaskPriority.RED,
    default: TaskPriority.BLUE,
  })
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.BLUE,
  })
  priority: TaskPriority;

  @ApiProperty({
    description: 'Timestamp when the task was created',
    example: '2024-05-12T15:37:58.987Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Whether the task is active',
    example: true,
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;
}
