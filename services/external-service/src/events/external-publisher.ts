import { rabbitmq } from '@platform/common';

const EXCHANGE = 'external_events';

export class ExternalEventPublisher {
    async setup(): Promise<void> {
        const channel = rabbitmq.publishChannel;
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    }

    async publishVerificationCompleted(userId: string, type: string, status: string, provider: string, reference?: string): Promise<void> {
        await rabbitmq.publish(EXCHANGE, `verification.${type.toLowerCase()}.completed`, {
            userId,
            type,
            status,
            provider,
            reference,
            timestamp: new Date().toISOString(),
        });
    }

    async publishPaymentStatusUpdated(orderId: string, status: string, provider: string, reference?: string): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'payment.status.updated', {
            orderId,
            status,
            provider,
            reference,
            timestamp: new Date().toISOString(),
        });
    }
}
