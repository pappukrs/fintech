import { rabbitmq } from '@platform/common';
import dotenv from 'dotenv';

dotenv.config();

export const connectRabbitMQ = async () => {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    try {
        await rabbitmq.connectWithRetry(rabbitUrl);
        console.log('Connected to RabbitMQ (Admin Service)');
    } catch (err) {
        console.error('Failed to connect to RabbitMQ', err);
        process.exit(1);
    }
};
