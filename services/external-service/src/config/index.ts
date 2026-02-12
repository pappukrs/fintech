import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3008,
    grpcPort: parseInt(process.env.GRPC_PORT || '50053'),
    nodeEnv: process.env.NODE_ENV || 'development',
};
