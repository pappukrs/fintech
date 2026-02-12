import { app } from './app';
import { db, logger } from '@platform/common';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL must be defined');
    }

    try {
        await db.connectWithRetry(process.env.DATABASE_URL);
        logger.info('Connected to Postgres');
    } catch (err) {
        logger.error(err);
    }

    app.listen(3000, () => {
        logger.info('Listening on port 3000');
    });
};

start();
