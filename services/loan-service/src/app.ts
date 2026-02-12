import express from 'express';
import dotenv from 'dotenv';
import { db, rabbitmq, metricsMiddleware } from '@platform/common';
import loanRoutes from './routes/loan.routes';
import { LoanService } from './services/loan.service';
import { LoanGrpcServer } from './grpc/server';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(metricsMiddleware);
app.use(express.json());

// Mount loan routes
app.use('/loans', loanRoutes);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({ service: 'Loan Service', status: 'Running' });
});

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'UP', service: 'loan-service' });
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

        // Initialize Service (tables, RabbitMQ)
        const loanService = new LoanService();
        await loanService.init();
        console.log('Loan Service initialized (DB tables & RabbitMQ)');

        const loanGrpcServer = new LoanGrpcServer();
        loanGrpcServer.start(process.env.GRPC_PORT || '50051');

        app.listen(port, () => {
            console.log(`Loan service is running on port ${port}`);
        });
    } catch (err) {
        console.error('Failed to start Loan service:', err);
        process.exit(1);
    }
};

start();
