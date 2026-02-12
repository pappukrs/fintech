import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'fintech-logic'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/metrics') {
        res.set('Content-Type', register.contentType);
        register.metrics().then((data) => res.send(data));
        return;
    }
    next();
};

export { register };
