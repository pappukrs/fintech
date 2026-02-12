import express from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { authRouter } from './routes/auth.routes';
import { errorHandler, NotFoundError, metricsMiddleware } from '@platform/common';

const app = express();

app.set('trust proxy', true);
app.use(metricsMiddleware);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);

app.use('/api/auth', authRouter);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'UP', service: 'auth-service' });
});

app.all(/(.*)/, async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
