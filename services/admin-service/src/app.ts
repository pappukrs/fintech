import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { connectRabbitMQ } from './config/rabbitmq';
import { metricsMiddleware } from '@platform/common';

dotenv.config();

const app = express();
const port = process.env.PORT || 3006;

app.use(metricsMiddleware);
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'UP', service: 'admin-service' });
});

import adminRoutes from './routes/admin.routes';

// Routes
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

import { AdminModel } from './models/admin.model';
import { AdminEvents } from './events/admin.events';

const start = async () => {
    try {
        await connectDB();
        await connectRabbitMQ();

        // Initialize DB tables
        await AdminModel.init();
        console.log('Admin Service DB Tables initialized');

        // Setup Event Consumers
        await AdminEvents.setupConsumers();

        app.listen(port, () => {
            console.log(`Admin Service running on port ${port}`);
        });
    } catch (err) {
        console.error('Failed to start Admin Service', err);
        process.exit(1);
    }
};

start();
