import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

interface PrismaError {
  code: string;
  message: string;
}

function isPrismaError(error: unknown): error is PrismaError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const dueDate = new Date(createTaskDto.dueDate);
      const task = await this.taskService.create({
        name: createTaskDto.name,
        dueDate,
        priority: createTaskDto.priority,
      });

      return {
        ...task,
        isOverdue: task.dueDate < new Date(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@Query('type') type?: 'pending' | 'overdue'): Promise<Task[]> {
    try {
      return await this.taskService.findAll(type);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    try {
      const updateData: { name?: string; dueDate?: Date; priority?: number } =
        {};
      if (updateTaskDto.name !== undefined)
        updateData.name = updateTaskDto.name;
      if (updateTaskDto.priority !== undefined)
        updateData.priority = updateTaskDto.priority;
      if (updateTaskDto.dueDate !== undefined) {
        updateData.dueDate = new Date(updateTaskDto.dueDate);
      }

      const task = await this.taskService.update(id, updateData);
      return task;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (isPrismaError(error) && error.code === 'P2025') {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    try {
      const task = await this.taskService.remove(id);
      return task;
    } catch (error) {
      if (isPrismaError(error) && error.code === 'P2025') {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
