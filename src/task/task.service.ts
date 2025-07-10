import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TaskService {
  private prisma = new PrismaClient();

  async create(data: { name: string; dueDate: Date; priority: number }) {
    return this.prisma.task.create({
      data: {
        name: data.name,
        dueDate: data.dueDate,
        priority: data.priority,
      },
    });
  }

  async findAll(type?: 'pending' | 'overdue') {
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

  async findOne(id: number) {
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
  ) {
    const task = await this.prisma.task.update({
      where: { id },
      data,
    });

    return {
      ...task,
      isOverdue: task.dueDate < new Date(),
    };
  }

  async remove(id: number) {
    const task = await this.prisma.task.delete({
      where: { id },
    });

    return {
      ...task,
      isOverdue: task.dueDate < new Date(),
    };
  }
}
