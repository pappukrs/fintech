import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3007,
    dbConnectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=${process.env.DB_SCHEMA || 'notification_schema'}`,
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672',
    },
    externalServiceGrpcUrl: process.env.EXTERNAL_SERVICE_GRPC_URL || 'external-service:50053',
    nodeEnv: process.env.NODE_ENV || 'development',
};
