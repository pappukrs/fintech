import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { logger } from '@platform/common';

const PROTO_PATH = path.resolve(__dirname, '../../../../proto/user.proto');

export class UserGrpcClient {
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
        const userProto = protoDescriptor.user;

        this.client = new userProto.UserService(
            address,
            grpc.credentials.createInsecure()
        );
    }

    verifyUser(userId: string): Promise<{ success: boolean; message: string }> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                return reject(new Error('gRPC client not initialized'));
            }

            this.client.VerifyUser({ user_id: userId }, (err: any, response: any) => {
                if (err) {
                    logger.error('Error calling User Service gRPC', { err });
                    return reject(err);
                }
                resolve(response);
            });
        });
    }

    getUser(userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                return reject(new Error('gRPC client not initialized'));
            }

            this.client.GetUser({ user_id: userId }, (err: any, response: any) => {
                if (err) {
                    logger.error('Error calling User Service gRPC GetUser', { err });
                    return reject(err);
                }
                resolve(response);
            });
        });
    }
}
