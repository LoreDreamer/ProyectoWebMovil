import { Request, Response } from 'express';

export interface PaginationOptions {
  enabled: boolean;
  page: number;
  limit: number;
  from: number;
  to: number;
}

const toPositiveInteger = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

export const getPaginationOptions = (
  req: Request,
  defaultLimit = 10,
  maxLimit = 50
): PaginationOptions => {
  const enabled = req.query.page !== undefined || req.query.limit !== undefined;
  const page = toPositiveInteger(req.query.page, 1);
  const requestedLimit = toPositiveInteger(req.query.limit, defaultLimit);
  const limit = Math.min(requestedLimit, maxLimit);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return {
    enabled,
    page,
    limit,
    from,
    to
  };
};

export const createPaginationMeta = (
  pagination: PaginationOptions,
  total = 0
) => {
  const safeTotal = Math.max(0, Number(total) || 0);

  return {
    page: pagination.page,
    limit: pagination.limit,
    total: safeTotal,
    totalPages: pagination.limit > 0 ? Math.ceil(safeTotal / pagination.limit) : 0
  };
};

export const sendOptionalPaginatedResponse = <T>(
  res: Response,
  items: T[],
  pagination: PaginationOptions,
  total?: number | null
) => {
  if (!pagination.enabled) {
    return res.json(items);
  }

  return res.json({
    ok: true,
    data: items,
    pagination: createPaginationMeta(pagination, total ?? items.length)
  });
};
