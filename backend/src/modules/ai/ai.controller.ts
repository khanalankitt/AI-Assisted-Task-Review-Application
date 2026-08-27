import { NextFunction, Request, Response } from 'express';
import { taskService } from '../tasks/task.service';
import { aiService } from './ai.service';

export const aiController = {
  async analyseTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = taskService.getTaskById(req.params.id);
      const result = await aiService.analyseTask(task);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
