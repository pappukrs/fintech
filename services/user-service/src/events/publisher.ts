import { rabbitmq } from '@platform/common';

const EXCHANGE = 'user_events';

export class UserEventPublisher {
    /**
     * Ensure the exchange exists before publishing
     */
    async setup(): Promise<void> {
        const channel = rabbitmq.publishChannel;
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    }

    /**
     * Publish user.profile.created event
     */
    async publishProfileCreated(userId: string, email: string): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'user.profile.created', {
            userId,
            email,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Publish user.kyc.verified event
     * Consumed by Loan Service, Notification Service, etc.
     */
    async publishKycVerified(userId: string): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'user.kyc.verified', {
            userId,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Publish user.profile.updated event
     */
    async publishProfileUpdated(userId: string, updatedFields: string[]): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'user.profile.updated', {
            userId,
            updatedFields,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Publish user.bank.updated event
     */
    async publishBankDetailsUpdated(userId: string): Promise<void> {
        await rabbitmq.publish(EXCHANGE, 'user.bank.updated', {
            userId,
            timestamp: new Date().toISOString(),
        });
    }
}
