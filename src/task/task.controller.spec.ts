/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const mockTask = {
    id: 1,
    name: 'Test Task',
    dueDate: new Date('2025-12-31'),
    priority: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTaskWithOverdue = {
    ...mockTask,
    isOverdue: false,
  };

  const mockTaskService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createTaskDto: CreateTaskDto = {
      name: 'Test Task',
      dueDate: '2025-12-31',
      priority: 3,
    };

    it('should create a task successfully', async () => {
      mockTaskService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto);

      expect(service.create).toHaveBeenCalledWith({
        name: createTaskDto.name,
        dueDate: new Date(createTaskDto.dueDate),
        priority: createTaskDto.priority,
      });
      expect(result).toEqual(mockTaskWithOverdue);
    });

    it('should handle service errors', async () => {
      mockTaskService.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createTaskDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const mockTasks = [mockTaskWithOverdue];
      mockTaskService.findAll.mockResolvedValue(mockTasks);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockTasks);
    });

    it('should return pending tasks when type=pending', async () => {
      const mockTasks = [mockTaskWithOverdue];
      mockTaskService.findAll.mockResolvedValue(mockTasks);

      const result = await controller.findAll('pending');

      expect(service.findAll).toHaveBeenCalledWith('pending');
      expect(result).toEqual(mockTasks);
    });

    it('should return overdue tasks when type=overdue', async () => {
      const mockTasks = [{ ...mockTaskWithOverdue, isOverdue: true }];
      mockTaskService.findAll.mockResolvedValue(mockTasks);

      const result = await controller.findAll('overdue');

      expect(service.findAll).toHaveBeenCalledWith('overdue');
      expect(result).toEqual(mockTasks);
    });

    it('should handle service errors', async () => {
      mockTaskService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    const updateTaskDto: UpdateTaskDto = {
      name: 'Updated Task',
      priority: 4,
    };

    it('should update a task successfully', async () => {
      const updatedTask = { ...mockTaskWithOverdue, ...updateTaskDto };
      mockTaskService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(1, updateTaskDto);

      expect(service.update).toHaveBeenCalledWith(1, {
        name: updateTaskDto.name,
        priority: updateTaskDto.priority,
      });
      expect(result).toEqual(updatedTask);
    });

    it('should update with dueDate', async () => {
      const updateWithDate = { ...updateTaskDto, dueDate: '2025-01-01' };
      const updatedTask = { ...mockTaskWithOverdue, ...updateWithDate };
      mockTaskService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(1, updateWithDate);

      expect(service.update).toHaveBeenCalledWith(1, {
        name: updateWithDate.name,
        priority: updateWithDate.priority,
        dueDate: new Date(updateWithDate.dueDate),
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw 404 when task not found', async () => {
      const prismaError = { code: 'P2025', message: 'Record not found' };
      mockTaskService.update.mockRejectedValue(prismaError);

      await expect(controller.update(999, updateTaskDto)).rejects.toThrow(
        new HttpException('Task not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle other service errors', async () => {
      mockTaskService.update.mockRejectedValue(new Error('Database error'));

      await expect(controller.update(1, updateTaskDto)).rejects.toThrow(
        new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('remove', () => {
    it('should remove a task successfully', async () => {
      mockTaskService.remove.mockResolvedValue(mockTaskWithOverdue);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTaskWithOverdue);
    });

    it('should throw 404 when task not found', async () => {
      const prismaError = { code: 'P2025', message: 'Record not found' };
      mockTaskService.remove.mockRejectedValue(prismaError);

      await expect(controller.remove(999)).rejects.toThrow(
        new HttpException('Task not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle other service errors', async () => {
      mockTaskService.remove.mockRejectedValue(new Error('Database error'));

      await expect(controller.remove(1)).rejects.toThrow(
        new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
