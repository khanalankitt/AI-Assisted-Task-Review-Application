import { Router } from 'express';
import { taskController } from './task.controller';
import { aiController } from '../ai/ai.controller';

const router = Router();

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.patch('/:id/status', taskController.updateStatus);

// AI analysis lives in its own module, but the route naturally hangs
// off /tasks/:id/analyse, so it's registered here alongside task routes.
router.post('/:id/analyse', aiController.analyseTask);

export default router;
