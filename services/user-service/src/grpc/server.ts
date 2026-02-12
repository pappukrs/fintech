import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { logger } from '@platform/common';
import { UserService } from '../services/user.service.js';

const PROTO_PATH = path.resolve(__dirname, '../../../../proto/user.proto');

const userService = new UserService();

/**
 * gRPC handler: GetUser
 * Called by other services (e.g. Loan Service) to fetch user details
 */
async function getUser(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) {
    try {
        const { user_id } = call.request;
        const profile = await userService.getProfile(user_id);

        if (!profile) {
            return callback({
                code: grpc.status.NOT_FOUND,
                message: 'User not found',
            });
        }

        callback(null, {
            id: profile.id,
            email: profile.email,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            phone_number: profile.phone_number || '',
            kyc_verified: profile.kyc_verified,
        });
    } catch (error) {
        callback({
            code: grpc.status.INTERNAL,
            message: 'Internal server error',
        });
    }
}

/**
 * gRPC handler: VerifyUser
 * Called by Loan Service to verify user exists and is KYC-verified
 */
async function verifyUser(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
) {
    try {
        const { user_id } = call.request;
        const profile = await userService.getProfile(user_id);

        if (!profile) {
            return callback(null, {
                success: false,
                message: 'User not found',
            });
        }

        if (!profile.kyc_verified) {
            return callback(null, {
                success: false,
                message: 'User KYC not verified',
            });
        }

        callback(null, {
            success: true,
            message: 'User verified',
        });
    } catch (error) {
        callback({
            code: grpc.status.INTERNAL,
            message: 'Internal server error',
        });
    }
}

/**
 * Start the gRPC server for User Service
 */
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
    const userProto = protoDescriptor.user;

    const server = new grpc.Server();

    server.addService(userProto.UserService.service, {
        GetUser: getUser,
        VerifyUser: verifyUser,
    });

    server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (err: Error | null, boundPort: number) => {
            if (err) {
                console.error('Failed to start gRPC server', err);
                return;
            }
            logger.info(`User gRPC server listening on port ${boundPort}`);
        }
    );
}
