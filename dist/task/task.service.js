"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let TaskService = class TaskService {
    prisma = new client_1.PrismaClient();
    async create(data) {
        return this.prisma.task.create({
            data: {
                name: data.name,
                dueDate: data.dueDate,
                priority: data.priority,
            },
        });
    }
    async findAll(type) {
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
    async findOne(id) {
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
    async update(id, data) {
        const task = await this.prisma.task.update({
            where: { id },
            data,
        });
        return {
            ...task,
            isOverdue: task.dueDate < new Date(),
        };
    }
    async remove(id) {
        const task = await this.prisma.task.delete({
            where: { id },
        });
        return {
            ...task,
            isOverdue: task.dueDate < new Date(),
        };
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)()
], TaskService);
//# sourceMappingURL=task.service.js.map