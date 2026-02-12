import express from 'express';
import { errorHandler, metricsMiddleware } from '@platform/common';

import emiRoutes from './routes/emi.routes';

const app = express();

app.use(metricsMiddleware);
app.use(express.json());

// Main router
app.use('/emis', emiRoutes);

// Health check
app.get('/health', (_req: express.Request, res: express.Response) => {
    res.json({ status: 'UP', service: 'emi-service' });
});

// Root endpoint
app.get('/', (_req: express.Request, res: express.Response) => {
    res.json({ service: 'EMI Service', status: 'Running' });
});

// Global error handler
app.use(errorHandler);

export { app };
