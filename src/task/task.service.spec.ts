/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let mockPrisma: any;

  const mockTask = {
    id: 1,
    name: 'Test Task',
    dueDate: new Date('2025-12-31'),
    priority: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOverdueTask = {
    id: 2,
    name: 'Overdue Task',
    dueDate: new Date('2020-01-01'),
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPrisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskService],
    }).compile();

    service = module.get<TaskService>(TaskService);
    (service as any).prisma = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createData = {
        name: 'Test Task',
        dueDate: new Date('2025-12-31'),
        priority: 3,
      };

      mockPrisma.task.create.mockResolvedValue(mockTask);

      const result = await service.create(createData);

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: createData,
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return all tasks with isOverdue field', async () => {
      const tasks = [mockTask, mockOverdueTask];
      mockPrisma.task.findMany.mockResolvedValue(tasks);

      const result = await service.findAll();

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        orderBy: [{ dueDate: 'asc' }, { name: 'asc' }, { priority: 'asc' }],
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ ...mockTask, isOverdue: false });
      expect(result[1]).toEqual({ ...mockOverdueTask, isOverdue: true });
    });

    it('should return only pending tasks when type=pending', async () => {
      const tasks = [mockTask, mockOverdueTask];
      mockPrisma.task.findMany.mockResolvedValue(tasks);

      const result = await service.findAll('pending');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ ...mockTask, isOverdue: false });
    });

    it('should return only overdue tasks when type=overdue', async () => {
      const tasks = [mockTask, mockOverdueTask];
      mockPrisma.task.findMany.mockResolvedValue(tasks);

      const result = await service.findAll('overdue');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ ...mockOverdueTask, isOverdue: true });
    });
  });

  describe('findOne', () => {
    it('should return a task with isOverdue field', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne(1);

      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({ ...mockTask, isOverdue: false });
    });

    it('should return null when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });

    it('should mark overdue task correctly', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockOverdueTask);

      const result = await service.findOne(2);

      expect(result).toEqual({ ...mockOverdueTask, isOverdue: true });
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateData = { name: 'Updated Task', priority: 4 };
      const updatedTask = { ...mockTask, ...updateData };
      mockPrisma.task.update.mockResolvedValue(updatedTask);

      const result = await service.update(1, updateData);

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual({ ...updatedTask, isOverdue: false });
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      mockPrisma.task.delete.mockResolvedValue(mockTask);

      const result = await service.remove(1);

      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({ ...mockTask, isOverdue: false });
    });
  });
});
