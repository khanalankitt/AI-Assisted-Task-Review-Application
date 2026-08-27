import { v4 as uuidv4 } from 'uuid';
import { taskRepository } from './task.repository';
import {
  CreateTaskInput,
  PaginatedResult,
  Task,
  TaskStatus,
} from './task.types';
import { isValidPriority, isValidStatus } from './task.validation';
import { ApiError } from '../../utils/ApiError';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 1000;

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export const taskService = {
  getTasks(options: {
    status?: string;
    page?: unknown;
    limit?: unknown;
  }): PaginatedResult<Task> {
    const { status } = options;
    if (status && !isValidStatus(status)) {
      throw new ApiError(400, `Invalid status filter: ${status}`);
    }

    let limit = parsePositiveInt(options.limit, DEFAULT_LIMIT);
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    const page = parsePositiveInt(options.page, 1);
    const offset = (page - 1) * limit;

    const { rows, total } = taskRepository.findAll({
      status: status as TaskStatus | undefined,
      limit,
      offset,
    });

    return {
      data: rows,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
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
