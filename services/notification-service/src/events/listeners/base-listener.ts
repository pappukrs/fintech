import { ConsumeMessage, Channel } from 'amqplib';
import { rabbitmq, logger } from '@platform/common';

export abstract class BaseListener {
    abstract queue: string;
    abstract exchange: string;
    abstract routingKey: string;

    protected channel?: Channel;

    async listen() {
        try {
            this.channel = await rabbitmq.connection.createChannel();
            if (!this.channel) throw new Error('Failed to create channel');

            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            await this.channel.assertQueue(this.queue, { durable: true });
            await this.channel.bindQueue(this.queue, this.exchange, this.routingKey);

            logger.info(`Listener for ${this.routingKey} initialized on queue ${this.queue}`);

            this.channel!.consume(this.queue, async (msg: ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const content = JSON.parse(msg.content.toString());
                    logger.info(`Received event: ${this.routingKey}`, { content });

                    await this.onMessage(content, msg);

                    this.channel?.ack(msg);
                } catch (error) {
                    logger.error(`Error processing event: ${this.routingKey}`, { error });
                    // Ack to avoid loop in demo environment, though in production we might nack
                    this.channel?.ack(msg);
                }
            });
        } catch (error) {
            logger.error(`Failed to setup listener for ${this.routingKey}`, { error });
        }
    }

    abstract onMessage(data: any, msg: ConsumeMessage): Promise<void>;
}
