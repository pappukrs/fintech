import { ConsumeMessage } from 'amqplib';
import { rabbitmq, logger } from '@platform/common';
import { EmiService } from '../../services/emi.service';

const emiService = new EmiService();

export const consumeLoanApproved = async () => {
    const queue = 'emi-service-loan-approved';
    const exchange = 'loan_events';
    const routingKey = 'loan.approved';

    try {
        const channel = await rabbitmq.connection.createChannel();
        await channel.assertExchange(exchange, 'topic', { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        logger.info(`Listening for ${routingKey} events...`);

        channel.consume(queue, async (msg: ConsumeMessage | null) => {
            if (!msg) return;

            try {
                const content = JSON.parse(msg.content.toString());
                logger.info('Received loan.approved event', { content });

                const { loanId, userId, amount, interestRate, tenureMonths } = content;

                if (!loanId || !userId || !amount || tenureMonths === undefined) {
                    logger.error('Invalid loan.approved event data', { content });
                    channel.ack(msg);
                    return;
                }

                const rate = interestRate !== undefined ? interestRate : 10;

                await emiService.generateEmiSchedule(loanId, userId, amount, rate, tenureMonths);

                channel.ack(msg);
            } catch (error) {
                logger.error('Error processing loan.approved event', { error });
                // Ack to avoid loop in this demo environment
                // channel.nack(msg, false, false); 
            }
        });
    } catch (error) {
        logger.error('Failed to setup loan.approved consumer', { error });
    }
};
