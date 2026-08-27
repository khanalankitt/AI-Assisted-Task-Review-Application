import { v4 as uuidv4 } from 'uuid';
import { taskRepository } from './task.repository';
import { CreateTaskInput, Task, TaskStatus } from './task.types';
import { isValidPriority, isValidStatus } from './task.validation';
import { ApiError } from '../../utils/ApiError';

export const taskService = {
  getTasks(status?: string): Task[] {
    if (status && !isValidStatus(status)) {
      throw new ApiError(400, `Invalid status filter: ${status}`);
    }
    return taskRepository.findAll(status as TaskStatus | undefined);
  },

  getTaskById(id: string): Task {
    const task = taskRepository.findById(id);
    if (!task) {
      throw new ApiError(404, `Task with id ${id} not found`);
    }
    return task;
  },

  createTask(input: CreateTaskInput): Task {
    if (!input.title || !input.description) {
      throw new ApiError(400, 'title and description are required');
    }
    if (!isValidPriority(input.priority)) {
      throw new ApiError(400, `Invalid priority: ${input.priority}`);
    }

    const task: Task = {
      id: uuidv4(),
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: TaskStatus.NEW,
      createdAt: new Date().toISOString(),
    };
    return taskRepository.create(task);
  },

  updateStatus(id: string, status: unknown): Task {
    if (!isValidStatus(status)) {
      throw new ApiError(400, `Invalid status value: ${status}`);
    }

    const existing = taskRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, `Task with id ${id} not found`);
    }

    const updated = taskRepository.updateStatus(id, status);
    if (!updated) {
      throw new ApiError(404, `Task with id ${id} not found`);
    }
    return updated;
  },
};
