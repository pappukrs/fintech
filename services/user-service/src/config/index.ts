import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3002', 10),
    grpcPort: parseInt(process.env.GRPC_PORT || '50052', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        name: process.env.DB_NAME || 'fintech_db',
        schema: process.env.DB_SCHEMA || 'user_schema',
    },
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },

    get dbConnectionString(): string {
        return `postgresql://${this.db.user}:${this.db.password}@${this.db.host}:${this.db.port}/${this.db.name}`;
    },
};
