import { rabbitmq } from '@platform/common';

const EXCHANGE = 'loan_events';

export class LoanEventPublisher {
    /**
     * Ensure the exchange exists before publishing
     */
    async setup(): Promise<void> {
        const channel = rabbitmq.publishChannel;
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    }

    /**
     * Publish loan.applied event
     */
    async publishLoanApplied(loanId: string, userId: string, amount: number): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'loan.applied', {
            loanId,
            userId,
            amount,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Publish loan.approved event
     */
    async publishLoanApproved(loanId: string, userId: string, amount: number, interestRate: number, tenureMonths: number): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'loan.approved', {
            loanId,
            userId,
            amount,
            interestRate,
            tenureMonths,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Publish loan.rejected event
     */
    async publishLoanRejected(loanId: string, userId: string, reason: string): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'loan.rejected', {
            loanId,
            userId,
            reason,
            timestamp: new Date().toISOString(),
        });
    }
}
