import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors';

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
    // Simple placeholder for JWT verification
    // In a real app, this would verify the token and set req.user
    next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).currentUser) {
        throw new NotAuthorizedError();
    }
    next();
};
