export class Task {
  id: number;
  name: string;
  dueDate: Date;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  isOverdue?: boolean;
}
