import { db } from '../../config/database';
import { Task, TaskStatus, AIAnalysis } from './task.types';

function mapRow(row: any): Task | undefined {
  if (!row) return undefined;
  return {
    ...row,
    analysis: row.analysis ? JSON.parse(row.analysis) : null,
  };
}

export const taskRepository = {
  findAll(status?: TaskStatus): Task[] {
    const rows = status
      ? db
          .prepare('SELECT * FROM tasks WHERE status = ? ORDER BY createdAt DESC')
          .all(status)
      : db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
    return rows.map((row: any) => mapRow(row)!);
  },

  findById(id: string): Task | undefined {
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    return mapRow(row);
  },

  create(task: Task): Task {
    db.prepare(
      `INSERT INTO tasks (id, title, description, priority, status, createdAt, analysis)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(task.id, task.title, task.description, task.priority, task.status, task.createdAt, task.analysis ? JSON.stringify(task.analysis) : null);
    return task;
  },

  updateStatus(id: string, status: TaskStatus): Task | undefined {
    const result = db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
    if (result.changes === 0) return undefined;
    return this.findById(id);
  },

  saveAnalysis(id: string, analysis: AIAnalysis): Task | undefined {
    const result = db
      .prepare('UPDATE tasks SET analysis = ? WHERE id = ?')
      .run(JSON.stringify(analysis), id);
    if (result.changes === 0) return undefined;
    return this.findById(id);
  },
};
