import { NextFunction, Request, Response } from 'express';
import { taskService } from './task.service';

export const taskController = {
  getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = taskService.getTasks({
        status: status as string | undefined,
        page,
        limit,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = taskService.getTaskById(req.params.id);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, priority } = req.body;
      const task = taskService.createTask({ title, description, priority });
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const task = taskService.updateStatus(req.params.id, status);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },
};
