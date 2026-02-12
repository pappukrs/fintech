import { LoanRepository } from '../repositories/loan.repository';
import { LoanDoc, LoanStatus } from '../models/loan.model';
import { UserGrpcClient } from '../grpc/client';
import { LoanEventPublisher } from '../events/publisher';
import { BadRequestError } from '@platform/common';

export class LoanService {
    private loanRepository: LoanRepository;
    private userGrpcClient: UserGrpcClient;
    private eventPublisher: LoanEventPublisher;

    constructor() {
        this.loanRepository = new LoanRepository();
        // The address will be injected from config/env in a real app, hardcoding/using env in app.ts is better
        // For now, let's assume it's passed or retrieved from env here.
        // We'll create a init method or pass it in constructor if we were using dependency injection.
        // Simple approach: create it here using process.env
        const userGrpcUrl = process.env.USER_SERVICE_GRPC_URL || 'localhost:50052';
        this.userGrpcClient = new UserGrpcClient(userGrpcUrl);
        this.eventPublisher = new LoanEventPublisher();
    }

    async init() {
        await this.loanRepository.createTable();
        await this.eventPublisher.setup();
    }

    async applyLoan(userId: string, amount: number, tenureMonths: number, interestRate: number): Promise<LoanDoc> {
        // 1. Verify User via gRPC
        const verification = await this.userGrpcClient.verifyUser(userId);

        if (!verification.success) {
            throw new BadRequestError(`User verification failed: ${verification.message}`);
        }

        // 2. Create Loan
        const loan = await this.loanRepository.create({
            user_id: userId,
            amount,
            tenure_months: tenureMonths,
            interest_rate: interestRate,
            status: LoanStatus.APPLIED
        });

        // 3. Publish Event
        await this.eventPublisher.publishLoanApplied(loan.id, userId, amount);

        return loan;
    }

    async getLoan(id: string): Promise<LoanDoc | null> {
        return this.loanRepository.findById(id);
    }

    async getLoansByUser(userId: string): Promise<LoanDoc[]> {
        return this.loanRepository.findByUserId(userId);
    }

    // Admin only function
    async approveLoan(id: string): Promise<LoanDoc> {
        const loan = await this.loanRepository.findById(id);
        if (!loan) {
            throw new BadRequestError('Loan not found');
        }

        if (loan.status !== LoanStatus.APPLIED) {
            throw new BadRequestError('Loan is not in APPLIED state');
        }

        const updatedLoan = await this.loanRepository.updateStatus(id, LoanStatus.APPROVED);
        if (!updatedLoan) throw new Error('Failed to update loan status');

        await this.eventPublisher.publishLoanApproved(
            updatedLoan.id,
            updatedLoan.user_id,
            updatedLoan.amount,
            updatedLoan.interest_rate,
            updatedLoan.tenure_months
        );

        return updatedLoan;
    }

    // Admin only function
    async rejectLoan(id: string, reason: string): Promise<LoanDoc> {
        const loan = await this.loanRepository.findById(id);
        if (!loan) {
            throw new BadRequestError('Loan not found');
        }

        if (loan.status !== LoanStatus.APPLIED) {
            throw new BadRequestError('Loan is not in APPLIED state');
        }

        const updatedLoan = await this.loanRepository.updateStatus(id, LoanStatus.REJECTED, reason);
        if (!updatedLoan) throw new Error('Failed to update loan status');

        await this.eventPublisher.publishLoanRejected(updatedLoan.id, updatedLoan.user_id, reason);

        return updatedLoan;
    }
}
