import { Pool } from 'pg';
import logger from '../logger';
import { retry } from '../utils/resilience';

class DatabaseManager {
    private pool: Pool | null = null;
    private static instance: DatabaseManager;

    private constructor() { }

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    public async connect(connectionString: string): Promise<void> {
        try {
            this.pool = new Pool({
                connectionString,
            });

            // Test connection
            await this.pool.query('SELECT NOW()');
            logger.info('Connected to PostgreSQL successfully');
        } catch (error) {
            logger.error('Failed to connect to PostgreSQL', { error });
            throw error;
        }
    }

    public async connectWithRetry(connectionString: string, retries: number = 5, delay: number = 2000): Promise<void> {
        await retry(
            () => this.connect(connectionString),
            retries,
            delay
        );
    }

    public getPool(): Pool {
        if (!this.pool) {
            throw new Error('Database pool not initialized. Call connect() first.');
        }
        return this.pool;
    }

    public async close(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            logger.info('PostgreSQL connection pool closed');
        }
    }

    public async query(text: string, params?: any[]) {
        return this.getPool().query(text, params);
    }
}

export const db = DatabaseManager.getInstance();
