import { ConsumeMessage } from 'amqplib';
import { BaseListener } from './base-listener.js';
import { logger } from '@platform/common';
import { NotificationRepository } from '../../repositories/notification.repository.js';
import { ExternalGrpcClient } from '../../grpc/client.js';
import { config } from '../../config/index.js';

export class PaymentCompletedListener extends BaseListener {
    queue = 'notification-service-payment-completed';
    exchange = 'payment_events';
    routingKey = 'payment.completed';

    private notificationRepository = new NotificationRepository();
    private externalClient = new ExternalGrpcClient(config.externalServiceGrpcUrl);

    async onMessage(data: any, msg: ConsumeMessage) {
        const { paymentId, userId, amount } = data;

        if (!userId) {
            logger.error('Missing userId in payment.completed event');
            return;
        }

        const message = `Payment of ₹${amount} successful. Transaction ID: ${paymentId}`;

        try {
            const phoneNumber = data.phoneNumber || '+919999999999';
            const response = await this.externalClient.sendSMS(phoneNumber, message);

            await this.notificationRepository.createNotification({
                user_id: userId,
                type: 'SMS',
                status: response.success ? 'SENT' : 'FAILED',
                content: { message, phoneNumber },
                error_message: response.success ? undefined : response.message
            });
        } catch (error: any) {
            logger.error('Error sending notification for payment.completed', { error });
            await this.notificationRepository.createNotification({
                user_id: userId,
                type: 'SMS',
                status: 'FAILED',
                content: { message },
                error_message: error.message
            });
        }
    }
}
