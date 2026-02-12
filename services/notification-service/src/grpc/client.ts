import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '@platform/common';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(__dirname, '../../../../proto/external.proto');

export class ExternalGrpcClient {
    private client: any;

    constructor(address: string) {
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

        this.client = new externalProto.ExternalService(
            address,
            grpc.credentials.createInsecure()
        );
    }

    sendSMS(phoneNumber: string, message: string, provider: string = 'default'): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                return reject(new Error('gRPC client not initialized'));
            }

            this.client.SendSMS({ phone_number: phoneNumber, message, provider }, (err: any, response: any) => {
                if (err) {
                    logger.error('Error calling External Service gRPC SendSMS', { err });
                    return reject(err);
                }
                resolve(response);
            });
        });
    }

    sendEmail(email: string, subject: string, body: string, provider: string = 'default'): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                return reject(new Error('gRPC client not initialized'));
            }

            this.client.SendEmail({ email, subject, body, provider }, (err: any, response: any) => {
                if (err) {
                    logger.error('Error calling External Service gRPC SendEmail', { err });
                    return reject(err);
                }
                resolve(response);
            });
        });
    }

    sendPush(userId: string, title: string, body: string): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                return reject(new Error('gRPC client not initialized'));
            }

            this.client.SendPush({ user_id: userId, title, body }, (err: any, response: any) => {
                if (err) {
                    logger.error('Error calling External Service gRPC SendPush', { err });
                    return reject(err);
                }
                resolve(response);
            });
        });
    }
}
