import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  private prisma = new PrismaClient();

  async create(data: {
    name: string;
    dueDate: Date;
    priority: number;
  }): Promise<Task> {
    return this.prisma.task.create({
      data: {
        name: data.name,
        dueDate: data.dueDate,
        priority: data.priority,
      },
    });
  }

  async findAll(type?: 'pending' | 'overdue'): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      orderBy: [{ dueDate: 'asc' }, { name: 'asc' }, { priority: 'asc' }],
    });

    const now = new Date();
    const tasksWithOverdue = tasks.map((task) => ({
      ...task,
      isOverdue: task.dueDate < now,
    }));

    if (type === 'pending') {
      return tasksWithOverdue.filter((task) => !task.isOverdue);
    }
    if (type === 'overdue') {
      return tasksWithOverdue.filter((task) => task.isOverdue);
    }

    return tasksWithOverdue;
  }

  async findOne(id: number): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return null;
    }

    return {
      ...task,
      isOverdue: task.dueDate < new Date(),
    };
  }

  async update(
    id: number,
    data: { name?: string; dueDate?: Date; priority?: number },
  ): Promise<Task> {
    const task = await this.prisma.task.update({
      where: { id },
      data,
    });

    return {
      ...task,
      isOverdue: task.dueDate < new Date(),
    };
  }

  async remove(id: number): Promise<Task> {
    const task = await this.prisma.task.delete({
      where: { id },
    });

    return {
      ...task,
      isOverdue: task.dueDate < new Date(),
    };
  }
}
