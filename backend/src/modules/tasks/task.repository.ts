import { db } from '../../config/database';
import { Task, TaskStatus } from './task.types';

export const taskRepository = {
  findAll(status?: TaskStatus): Task[] {
    if (status) {
      return db
        .prepare('SELECT * FROM tasks WHERE status = ? ORDER BY createdAt DESC')
        .all(status) as Task[];
    }
    return db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all() as Task[];
  },

  findById(id: string): Task | undefined {
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
  },

  create(task: Task): Task {
    db.prepare(
      `INSERT INTO tasks (id, title, description, priority, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(task.id, task.title, task.description, task.priority, task.status, task.createdAt);
    return task;
  },

  updateStatus(id: string, status: TaskStatus): Task | undefined {
    const result = db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
    if (result.changes === 0) return undefined;
    return this.findById(id);
  },
};
