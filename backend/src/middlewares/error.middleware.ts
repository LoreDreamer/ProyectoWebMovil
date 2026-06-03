import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../shared/errors/ApiError';

export const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      ok: false,
      message: error.message,
      details: error.details
    });
  }

  const message = error instanceof Error ? error.message : 'Error interno del servidor';

  console.error('Error no controlado:', error);

  return res.status(500).json({
    ok: false,
    message
  });
};
