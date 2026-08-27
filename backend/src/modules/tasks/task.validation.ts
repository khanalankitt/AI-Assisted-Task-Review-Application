import { TaskPriority, TaskStatus } from './task.types';

export const VALID_STATUSES = Object.values(TaskStatus);
export const VALID_PRIORITIES = Object.values(TaskPriority);

export function isValidStatus(status: unknown): status is TaskStatus {
  return typeof status === 'string' && VALID_STATUSES.includes(status as TaskStatus);
}

export function isValidPriority(priority: unknown): priority is TaskPriority {
  return typeof priority === 'string' && VALID_PRIORITIES.includes(priority as TaskPriority);
}
