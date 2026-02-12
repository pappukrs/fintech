import express from 'express';
import { db, rabbitmq, logger, errorHandler, metricsMiddleware } from '@platform/common';
import { config } from './config/index.js';
import { NotificationRepository } from './repositories/notification.repository.js';
import { LoanCreatedListener } from './events/listeners/loan-created.listener.js';
import { LoanApprovedListener } from './events/listeners/loan-approved.listener.js';
import { PaymentCompletedListener } from './events/listeners/payment-completed.listener.js';

const app = express();

app.use(metricsMiddleware);
app.use(express.json());

// Health check
app.get('/health', (_req: express.Request, res: express.Response) => {
    res.json({ status: 'UP', service: 'notification-service' });
});

// Root endpoint
app.get('/', (_req: express.Request, res: express.Response) => {
    res.json({ service: 'Notification Service', status: 'Running' });
});

// Global error handler
app.use(errorHandler);

const start = async () => {
    try {
        // Connect to PostgreSQL
        await db.connectWithRetry(config.dbConnectionString);
        logger.info('Connected to PostgreSQL');

        // Initialize tables
        const notificationRepository = new NotificationRepository();
        await notificationRepository.createTable();
        logger.info('Notification tables initialized');

        // Connect to RabbitMQ
        await rabbitmq.connectWithRetry(config.rabbitmq.url);
        logger.info('Connected to RabbitMQ');

        // Start Consumers
        await new LoanCreatedListener().listen();
        await new LoanApprovedListener().listen();
        await new PaymentCompletedListener().listen();
        logger.info('Notification consumers started');

        // Start Express server
        app.listen(config.port, () => {
            logger.info(`Notification service is running on port ${config.port}`);
        });
    } catch (err) {
        logger.error('Failed to start Notification service:', err);
        process.exit(1);
    }
};

start();

export { app };
