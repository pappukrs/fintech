import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const PROTO_PATH = path.resolve(__dirname, '../../../../proto/loan.proto');

export class LoanGrpcClient {
    private client: any;

    constructor() {
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
        const address = process.env.LOAN_GRPC_URL || 'loan-service:50051';

        this.client = new loanProto.LoanService(
            address,
            grpc.credentials.createInsecure()
        );
    }

    approveLoan(loanId: string, adminId: string, reason: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                return reject(new Error('gRPC client not initialized'));
            }

            this.client.ApproveLoan({ loan_id: loanId, admin_id: adminId, reason }, (err: any, response: any) => {
                if (err) {
                    console.error('Error calling Loan Service gRPC ApproveLoan', err);
                    return reject(err);
                }
                resolve(response);
            });
        });
    }

    rejectLoan(loanId: string, adminId: string, reason: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.client) {
                return reject(new Error('gRPC client not initialized'));
            }

            this.client.RejectLoan({ loan_id: loanId, admin_id: adminId, reason }, (err: any, response: any) => {
                if (err) {
                    console.error('Error calling Loan Service gRPC RejectLoan', err);
                    return reject(err);
                }
                resolve(response);
            });
        });
    }
}

export const loanGrpcClient = new LoanGrpcClient();
