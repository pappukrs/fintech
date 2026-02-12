import { EmiRepository } from '../repositories/emi.repository';
import { EmiDoc, EmiStatus } from '../models/emi.model';
import { logger } from '@platform/common';

export class EmiService {
    private emiRepository: EmiRepository;

    constructor() {
        this.emiRepository = new EmiRepository();
    }

    /**
     * Calculate EMI amount
     * Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
     * P = Principal
     * R = Monthly Interest Rate (Annual Rate / 12 / 100)
     * N = Tenure in Months
     */
    private calculateEmiAmount(principal: number, annualInterestRate: number, tenureMonths: number): number {
        if (annualInterestRate === 0) {
            return principal / tenureMonths;
        }

        const r = annualInterestRate / 12 / 100;
        const n = tenureMonths;

        const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

        // Round to 2 decimal places
        return Math.round(emi * 100) / 100;
    }

    /**
     * Generate EMI schedule for a loan
     * - Logic:
     *   - Calculate EMI amount
     *   - Generate N records, each due 1 month apart starting next month
     *   - Store in DB
     */
    async generateEmiSchedule(
        loanId: string,
        userId: string,
        amount: number,
        interestRate: number,
        tenureMonths: number
    ): Promise<EmiDoc[]> {
        logger.info(`Generating EMI schedule for Loan ID: ${loanId}`);

        // 1. Check if EMIs already exist for this loan (Idempotency check)
        const existingEmis = await this.emiRepository.findByLoanId(loanId);
        if (existingEmis.length > 0) {
            logger.warn(`EMI schedule already exists for Loan ID: ${loanId}. Skipping.`);
            return existingEmis;
        }

        // 2. Calculate EMI Amount
        const emiAmount = this.calculateEmiAmount(amount, interestRate, tenureMonths);
        const emisToCreate: Partial<EmiDoc>[] = [];
        const currentDate = new Date();

        // 3. Generate Schedule
        for (let i = 1; i <= tenureMonths; i++) {
            const dueDate = new Date(currentDate);
            dueDate.setMonth(dueDate.getMonth() + i); // 1st EMI next month, etc.

            emisToCreate.push({
                loan_id: loanId,
                user_id: userId,
                amount: emiAmount,
                due_date: dueDate,
                status: EmiStatus.PENDING,
                penalty_amount: 0
            });
        }

        // 4. Store in DB
        const createdEmis = await this.emiRepository.createBulk(emisToCreate);
        logger.info(`Generated ${createdEmis.length} EMI records for Loan ID: ${loanId}`);

        return createdEmis;
    }

    async getEmisByLoanId(loanId: string): Promise<EmiDoc[]> {
        return this.emiRepository.findByLoanId(loanId);
    }

    async getEmisByUserId(userId: string): Promise<EmiDoc[]> {
        return this.emiRepository.findByUserId(userId);
    }

    async getEmi(id: string): Promise<EmiDoc | null> {
        return this.emiRepository.findById(id);
    }
}
