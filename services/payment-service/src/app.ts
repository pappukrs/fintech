import express from 'express';
import dotenv from 'dotenv';
import { db, rabbitmq, metricsMiddleware } from '@platform/common';
import paymentRoutes, { initializeRoutes } from './routes/payment.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

app.use(metricsMiddleware);
app.use(express.json());

// Mount payment routes
app.use('/payments', paymentRoutes);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({ service: 'Payment Service', status: 'Running' });
});

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'UP', service: 'payment-service' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            status: 'error',
            errors: err.serializeErrors ? err.serializeErrors() : [{ message: err.message }],
        });
    }

    console.error('Unhandled error:', err);
    return res.status(500).json({
        status: 'error',
        errors: [{ message: 'Internal server error' }],
    });
});

const start = async () => {
    try {
        const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

        // Connect to PostgreSQL
        await db.connectWithRetry(dbUrl);
        console.log('Connected to PostgreSQL');

        // Connect to RabbitMQ
        await rabbitmq.connectWithRetry(process.env.RABBITMQ_URL || 'amqp://localhost');
        console.log('Connected to RabbitMQ');

        // Initialize Routes (which initializes Service and creates tables)
        await initializeRoutes();
        console.log('Payment Service initialized (DB tables & RabbitMQ)');

        app.listen(port, () => {
            console.log(`Payment service is running on port ${port}`);
        });
    } catch (err) {
        console.error('Failed to start Payment service:', err);
        process.exit(1);
    }
};

start();
