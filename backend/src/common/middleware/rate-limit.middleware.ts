import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const bucket = new Map<string, { count: number; ts: number }>();

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const windowMs = 60_000;
    const max = 120;
    const current = bucket.get(key);
    if (!current || now - current.ts > windowMs) {
      bucket.set(key, { count: 1, ts: now });
      return next();
    }
    if (current.count >= max) {
      return res
        .status(429)
        .json({ success: false, error: 'Too many requests' });
    }
    current.count += 1;
    next();
  }
}
