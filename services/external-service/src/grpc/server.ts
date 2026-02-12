import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '@platform/common';
import { ExternalService } from '../services/external.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(__dirname, '../../../../proto/external.proto');

const externalService = new ExternalService();

async function verifyPAN(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) {
    try {
        const { user_id, pan_number, name_on_card } = call.request;
        const result = await externalService.verifyPAN(user_id, pan_number, name_on_card);
        callback(null, {
            success: result.success,
            message: result.message,
            provider_reference: result.provider_reference,
            response_payload: JSON.stringify(result.response_payload)
        });
    } catch (error: any) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message || 'Internal server error',
        });
    }
}

async function verifyAadhaar(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) {
    try {
        const { user_id, aadhaar_number } = call.request;
        const result = await externalService.verifyAadhaar(user_id, aadhaar_number);
        callback(null, {
            success: result.success,
            message: result.message,
            provider_reference: result.provider_reference,
            response_payload: JSON.stringify(result.response_payload)
        });
    } catch (error: any) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message || 'Internal server error',
        });
    }
}

async function verifyBankAccount(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) {
    try {
        const { user_id, account_number, ifsc, name_at_bank } = call.request;
        const result = await externalService.verifyBank(user_id, account_number, ifsc, name_at_bank);
        callback(null, {
            success: result.success,
            message: result.message,
            provider_reference: result.provider_reference,
            response_payload: JSON.stringify(result.response_payload)
        });
    } catch (error: any) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message || 'Internal server error',
        });
    }
}

async function initializePayment(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) {
    try {
        const { user_id, amount, currency, order_id, customer_phone, customer_email } = call.request;
        const result = await externalService.initializePayment(user_id, {
            amount, currency, order_id, customer_phone, customer_email
        });
        callback(null, {
            success: result.success,
            message: result.message,
            payment_session_id: result.payment_session_id,
            payment_url: result.payment_url,
            order_id: result.order_id,
            status: 'PENDING'
        });
    } catch (error: any) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message || 'Internal server error',
        });
    }
}

async function getPaymentStatus(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) {
    try {
        const { order_id } = call.request;
        const result = await externalService.getPaymentStatus(order_id);
        callback(null, {
            success: result.success,
            message: result.message,
            order_id,
            status: result.status,
            provider_reference: result.provider_reference
        });
    } catch (error: any) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message || 'Internal server error',
        });
    }
}

async function sendSMS(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) {
    const { phone_number, message, provider } = call.request;
    logger.info(`[MOCK] Sending SMS to ${phone_number} via ${provider}: ${message}`);
    callback(null, { success: true, message: 'SMS sent successfully' });
}

async function sendEmail(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) {
    const { email, subject, body, provider } = call.request;
    logger.info(`[MOCK] Sending Email to ${email} via ${provider}: ${subject}`);
    callback(null, { success: true, message: 'Email sent successfully' });
}

async function sendPush(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) {
    const { user_id, title, body } = call.request;
    logger.info(`[MOCK] Sending Push to ${user_id}: ${title} - ${body}`);
    callback(null, { success: true, message: 'Push notification sent successfully' });
}

export function startGrpcServer(port: number): void {
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [path.resolve(__dirname, '../../../../proto')],
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
    const externalProto = protoDescriptor.external;

    const server = new grpc.Server();

    server.addService(externalProto.ExternalService.service, {
        VerifyPAN: verifyPAN,
        VerifyAadhaar: verifyAadhaar,
        VerifyBankAccount: verifyBankAccount,
        InitializePayment: initializePayment,
        GetPaymentStatus: getPaymentStatus,
        SendSMS: sendSMS,
        SendEmail: sendEmail,
        SendPush: sendPush,
    });

    server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (err: Error | null, boundPort: number) => {
            if (err) {
                console.error('Failed to start gRPC server', err);
                return;
            }
            logger.info(`External gRPC server listening on port ${boundPort}`);
        }
    );
}
