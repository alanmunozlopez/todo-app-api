import { Task } from './entities/task.entity';
export declare class TaskService {
    private prisma;
    create(data: {
        name: string;
        dueDate: Date;
        priority: number;
    }): Promise<Task>;
    findAll(type?: 'pending' | 'overdue'): Promise<Task[]>;
    findOne(id: number): Promise<Task | null>;
    update(id: number, data: {
        name?: string;
        dueDate?: Date;
        priority?: number;
    }): Promise<Task>;
    remove(id: number): Promise<Task>;
}
