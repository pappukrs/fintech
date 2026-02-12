import express from 'express';
import { config } from './config/index.js';
import { db, rabbitmq, metricsMiddleware } from '@platform/common';
import userRoutes from './routes/user.routes.js';
import { startGrpcServer } from './grpc/server.js';
import { UserService } from './services/user.service.js';

const app = express();

app.use(metricsMiddleware);
app.use(express.json());

// Mount user routes
app.use('/users', userRoutes);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({ service: 'User Service', status: 'Running' });
});

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'UP', service: 'user-service' });
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
        // Connect to PostgreSQL
        await db.connectWithRetry(config.dbConnectionString);
        console.log('Connected to PostgreSQL');

        // Initialize tables
        const userService = new UserService();
        await userService.init();
        console.log('User tables initialized');

        // Connect to RabbitMQ (optional — graceful if unavailable)
        // Connect to RabbitMQ
        await rabbitmq.connectWithRetry(config.rabbitmq.url);
        console.log('Connected to RabbitMQ');

        // Start gRPC server
        startGrpcServer(config.grpcPort);

        // Start Express server
        app.listen(config.port, () => {
            console.log(`User service is running on port ${config.port}`);
            console.log(`gRPC server listening on port ${config.grpcPort}`);
        });
    } catch (err) {
        console.error('Failed to start User service:', err);
        process.exit(1);
    }
};

start();
