import { app } from './app';
import { config } from './config/index';
import { db, rabbitmq, logger } from '@platform/common';
import { EmiRepository } from './repositories/emi.repository';
import { consumeLoanApproved } from './events/consumers/loan-approved.consumer';

const start = async () => {
    try {
        // Connect to PostgreSQL
        await db.connectWithRetry(config.dbConnectionString);
        logger.info('Connected to PostgreSQL');

        // Initialize tables
        const emiRepository = new EmiRepository();
        await emiRepository.createTable();
        logger.info('EMI tables initialized');

        // Connect to RabbitMQ
        await rabbitmq.connectWithRetry(config.rabbitmq.url);
        logger.info('Connected to RabbitMQ');

        // Start Consumers
        await consumeLoanApproved();

        // Start Express server
        app.listen(config.port, () => {
            logger.info(`EMI service is running on port ${config.port}`);
        });
    } catch (err) {
        logger.error('Failed to start EMI service:', err);
        process.exit(1);
    }
};

start();
