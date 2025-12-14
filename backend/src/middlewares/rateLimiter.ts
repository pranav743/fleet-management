import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';
import AppError from '../utils/AppError';

const rateLimiter = (limit: number, windowSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const key = `rate_limit:${ip}`;

    try {
      const requests = await redisClient.incr(key);

      if (requests === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (requests > limit) {
        return next(new AppError('Too many requests, please try again later.', 429));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default rateLimiter;
