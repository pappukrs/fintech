import * as amqp from 'amqplib';
import logger from '../logger';
import { retry } from '../utils/resilience';

class RabbitMQWrapper {
    private _connection: any;
    private _publishChannel: any;

    get connection() {
        if (!this._connection) {
            throw new Error('Cannot access RabbitMQ connection before connecting');
        }
        return this._connection;
    }

    get publishChannel() {
        if (!this._publishChannel) {
            throw new Error('Cannot access RabbitMQ publish channel before connecting');
        }
        return this._publishChannel;
    }

    async connect(url: string) {
        try {
            this._connection = await amqp.connect(url);
            this._publishChannel = await this._connection.createChannel();
            logger.info('Connected to RabbitMQ successfully');

            this._connection.on('close', () => {
                logger.error('RabbitMQ connection closed!');
                process.exit();
            });

            this._connection.on('error', (err: any) => {
                logger.error('RabbitMQ connection error', { err });
            });
        } catch (error) {
            logger.error('Failed to connect to RabbitMQ', { error });
            throw error;
        }
    }

    async connectWithRetry(url: string, retries: number = 5, delay: number = 2000) {
        await retry(
            () => this.connect(url),
            retries,
            delay
        );
    }

    async publish(exchange: string, routingKey: string, data: any) {
        try {
            this.publishChannel.publish(
                exchange,
                routingKey,
                Buffer.from(JSON.stringify(data)),
                { persistent: true }
            );
        } catch (error) {
            logger.error('Failed to publish event to RabbitMQ', { error, exchange, routingKey });
            throw error;
        }
    }

    async subscribe(queue: string, onMessage: (msg: any) => void) {
        try {
            const channel = await this.connection.createChannel();
            await channel.assertQueue(queue, { durable: true });
            channel.consume(queue, onMessage, { noAck: false });
        } catch (error) {
            logger.error('Failed to subscribe to RabbitMQ queue', { error, queue });
            throw error;
        }
    }
}

export default new RabbitMQWrapper();
