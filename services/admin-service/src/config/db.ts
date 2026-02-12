import { db } from '@platform/common';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    await db.connectWithRetry(dbUrl);
    console.log('Connected to PostgreSQL (Admin Service)');
};
