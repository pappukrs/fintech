import express from 'express';
import dotenv from 'dotenv';
import { db, rabbitmq, logger, metricsMiddleware } from '@platform/common';
import { startGrpcServer } from './grpc/server.js';
import { ExternalService } from './services/external.service.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3008;
const grpcPort = parseInt(process.env.GRPC_PORT || '50053');

app.use(metricsMiddleware);
app.use(express.json());

// Root endpoint
app.get('/', (_req, res) => {
    res.json({ service: 'External Service', status: 'Running' });
});

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'UP', service: 'external-service' });
});

// Webhook endpoint (placeholder for future vendor integrations)
app.post('/webhooks/:provider', async (req, res) => {
    const { provider } = req.params;
    logger.info(`Received webhook from ${provider}`);
    // Handle webhook logic here
    res.json({ success: true });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
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
        logger.info('Connected to PostgreSQL');

        // Connect to RabbitMQ
        await rabbitmq.connectWithRetry(process.env.RABBITMQ_URL || 'amqp://localhost');
        logger.info('Connected to RabbitMQ');

        // Initialize Service (Setup publishers)
        const externalServiceInstance = new ExternalService();
        await externalServiceInstance.init();
        logger.info('External Service logic initialized');

        // Start gRPC Server
        startGrpcServer(grpcPort);

        app.listen(port, () => {
            logger.info(`External HTTP service is running on port ${port}`);
        });
    } catch (err) {
        logger.error('Failed to start External service:', err);
        process.exit(1);
    }
};

start();

export { app };
