import express from 'express';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { errorHandler, metricsMiddleware } from '@platform/common';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(metricsMiddleware);
app.use(morgan('dev'));
app.use(express.json());

// Service URLs from environment variables
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3002';
const LOAN_SERVICE_URL = process.env.LOAN_SERVICE_URL || 'http://loan-service:3003';
const EMI_SERVICE_URL = process.env.EMI_SERVICE_URL || 'http://emi-service:3004';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004';
const EXTERNAL_SERVICE_URL = process.env.EXTERNAL_SERVICE_URL || 'http://external-service:3008';
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://admin-service:3006';

// Health check
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'UP', service: 'API Gateway' });
});

// Proxy routes
app.use('/v1/auth', createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/v1/auth': '' },
}));

app.use('/v1/users', createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/v1/users': '' },
}));

app.use('/v1/loans', createProxyMiddleware({
    target: LOAN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/v1/loans': '' },
}));

app.use('/v1/emis', createProxyMiddleware({
    target: EMI_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/v1/emis': '' },
}));

app.use('/v1/payments', createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/v1/payments': '' },
}));

app.use('/v1/external', createProxyMiddleware({
    target: EXTERNAL_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/v1/external': '' },
}));

app.use('/v1/admin', createProxyMiddleware({
    target: ADMIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/v1/admin': '' },
}));

// Error handling
app.use(errorHandler);

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
