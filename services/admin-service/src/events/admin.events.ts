import { ConsumeMessage } from 'amqplib';
import { rabbitmq, logger } from '@platform/common';
import { AdminModel } from '../models/admin.model';

export class AdminEvents {
    static async setupConsumers() {
        try {
            const channel = await rabbitmq.connection.createChannel();

            // Setup for loan events
            const loanExchange = 'loan_events';
            const loanQueue = 'admin-service-loan-events';
            await channel.assertExchange(loanExchange, 'topic', { durable: true });
            await channel.assertQueue(loanQueue, { durable: true });
            await channel.bindQueue(loanQueue, loanExchange, 'loan.created');

            channel.consume(loanQueue, async (msg: ConsumeMessage | null) => {
                if (!msg) return;
                try {
                    const content = JSON.parse(msg.content.toString());
                    logger.info('Admin Service: loan.created event received', { content });
                    await AdminModel.incrementStat('total_loans');
                    channel.ack(msg);
                } catch (err) {
                    logger.error('Error processing loan.created event', err);
                    channel.ack(msg); // Ack to avoid infinite loops in this setup
                }
            });

            // Setup for user events
            const userExchange = 'user_events';
            const userQueue = 'admin-service-user-events';
            await channel.assertExchange(userExchange, 'topic', { durable: true });
            await channel.assertQueue(userQueue, { durable: true });
            await channel.bindQueue(userQueue, userExchange, 'user.created');

            channel.consume(userQueue, async (msg: ConsumeMessage | null) => {
                if (!msg) return;
                try {
                    const content = JSON.parse(msg.content.toString());
                    logger.info('Admin Service: user.created event received', { content });
                    await AdminModel.incrementStat('total_users');
                    channel.ack(msg);
                } catch (err) {
                    logger.error('Error processing user.created event', err);
                    channel.ack(msg);
                }
            });

            logger.info('Admin Service: Event consumers setup successfully');
        } catch (error) {
            logger.error('Failed to setup Admin Service consumers', { error });
        }
    }
}
