import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

// Centralised error handler. Any error passed via next(err) ends up here,
// so a failing AI call or bad DB write returns a proper JSON error
// instead of crashing the process.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({ message: 'Internal server error' });
}
