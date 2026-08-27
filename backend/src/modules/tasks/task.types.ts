export enum TaskStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface AIAnalysis {
  category: string;
  priority: TaskPriority;
  summary: string;
  recommendedAction: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  analysis?: AIAnalysis | null;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
}
