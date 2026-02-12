import { rabbitmq } from '@platform/common';

const EXCHANGE = 'payment_events';

export class PaymentEventPublisher {
    async setup(): Promise<void> {
        const channel = rabbitmq.publishChannel;
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    }

    async publishPaymentCreated(paymentId: string, orderId: string, userId: string, amount: number): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'payment.created', {
            paymentId,
            orderId,
            userId,
            amount,
            timestamp: new Date().toISOString(),
        });
    }

    async publishPaymentCompleted(paymentId: string, orderId: string, userId: string, amount: number, loanId: string, emiId?: string): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'payment.completed', {
            paymentId,
            orderId,
            userId,
            amount,
            loanId,
            emiId,
            timestamp: new Date().toISOString(),
        });
    }

    async publishPaymentFailed(paymentId: string, orderId: string, userId: string, reason: string): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'payment.failed', {
            paymentId,
            orderId,
            userId,
            reason,
            timestamp: new Date().toISOString(),
        });
    }
}
