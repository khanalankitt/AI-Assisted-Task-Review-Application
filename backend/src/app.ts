import express from 'express';
import cors from 'cors';
import taskRoutes from './modules/tasks/task.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/tasks', taskRoutes);

app.use(errorHandler);

export default app;
