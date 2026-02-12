import { rabbitmq, logger } from '@platform/common';

const EXCHANGE = 'loan_events';

export class LoanEventPublisher {
    async setup(): Promise<void> {
        const channel = rabbitmq.publishChannel;
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    }

    async publishLoanCreated(data: {
        loanId: string;
        userId: string;
        amount: number;
        loanType: string;
    }): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'loan.created', {
            event: 'loan.created',
            data,
            timestamp: new Date().toISOString(),
        });
        logger.info('Published loan.created event', { loanId: data.loanId });
    }

    async publishLoanApproved(data: {
        loanId: string;
        userId: string;
        amount: number;
    }): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'loan.approved', {
            event: 'loan.approved',
            data,
            timestamp: new Date().toISOString(),
        });
        logger.info('Published loan.approved event', { loanId: data.loanId });
    }

    async publishLoanRejected(data: {
        loanId: string;
        userId: string;
        reason: string;
    }): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'loan.rejected', {
            event: 'loan.rejected',
            data,
            timestamp: new Date().toISOString(),
        });
        logger.info('Published loan.rejected event', { loanId: data.loanId });
    }

    async publishLoanDisbursed(data: {
        loanId: string;
        userId: string;
        amount: number;
    }): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'loan.disbursed', {
            event: 'loan.disbursed',
            data,
            timestamp: new Date().toISOString(),
        });
        logger.info('Published loan.disbursed event', { loanId: data.loanId });
    }
}
