import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { LoanService } from '../services/loan.service';
import { logger } from '@platform/common';

const PROTO_PATH = path.resolve(__dirname, '../../../../proto/loan.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [path.resolve(__dirname, '../../../../proto')],
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const loanProto = protoDescriptor.loan;

const loanService = new LoanService();

export class LoanGrpcServer {
    private server: grpc.Server;

    constructor() {
        this.server = new grpc.Server();
        this.server.addService(loanProto.LoanService.service, {
            ApproveLoan: this.approveLoan.bind(this),
            RejectLoan: this.rejectLoan.bind(this),
            GetLoan: this.getLoan.bind(this),
        });
    }

    async approveLoan(call: any, callback: any) {
        try {
            const { loan_id, admin_id, reason } = call.request;
            logger.info('gRPC: ApproveLoan called', { loan_id, admin_id });

            const updatedLoan = await loanService.approveLoan(loan_id);

            callback(null, {
                success: true,
                message: 'Loan approved successfully',
                status: updatedLoan.status
            });
        } catch (err: any) {
            logger.error('gRPC: ApproveLoan error', { err });
            callback(null, {
                success: false,
                message: err.message || 'Internal error'
            });
        }
    }

    async rejectLoan(call: any, callback: any) {
        try {
            const { loan_id, admin_id, reason } = call.request;
            logger.info('gRPC: RejectLoan called', { loan_id, admin_id });

            const updatedLoan = await loanService.rejectLoan(loan_id, reason);

            callback(null, {
                success: true,
                message: 'Loan rejected successfully',
                status: updatedLoan.status
            });
        } catch (err: any) {
            logger.error('gRPC: RejectLoan error', { err });
            callback(null, {
                success: false,
                message: err.message || 'Internal error'
            });
        }
    }

    async getLoan(call: any, callback: any) {
        try {
            const { loan_id } = call.request;
            const loan = await loanService.getLoan(loan_id);

            if (!loan) {
                return callback(null, {
                    success: false,
                    message: 'Loan not found'
                });
            }

            callback(null, {
                success: true,
                message: 'Loan retrieved',
                status: loan.status
            });
        } catch (err: any) {
            callback(null, {
                success: false,
                message: err.message || 'Internal error'
            });
        }
    }

    start(port: string = '50051') {
        this.server.bindAsync(
            `0.0.0.0:${port}`,
            grpc.ServerCredentials.createInsecure(),
            (err, port) => {
                if (err) {
                    logger.error('Failed to bind gRPC server', { err });
                    return;
                }
                logger.info(`Loan gRPC server listening on port ${port}`);
            }
        );
    }
}
