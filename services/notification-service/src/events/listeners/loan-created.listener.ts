import { ConsumeMessage } from 'amqplib';
import { BaseListener } from './base-listener.js';
import { logger } from '@platform/common';
import { NotificationRepository } from '../../repositories/notification.repository.js';
import { ExternalGrpcClient } from '../../grpc/client.js';
import { config } from '../../config/index.js';

export class LoanCreatedListener extends BaseListener {
    queue = 'notification-service-loan-created';
    exchange = 'loan_events';
    routingKey = 'loan.created';

    private notificationRepository = new NotificationRepository();
    private externalClient = new ExternalGrpcClient(config.externalServiceGrpcUrl);

    async onMessage(data: any, msg: ConsumeMessage) {
        const { loanId, userId, amount } = data;

        if (!userId) {
            logger.error('Missing userId in loan.created event');
            return;
        }

        const message = `Your loan application for ₹${amount} has been received. Loan ID: ${loanId}`;

        try {
            // In a real app, we'd fetch the user's phone number/email via gRPC from User Service
            // For now, we'll mock it or assume it's in the event if available
            const phoneNumber = data.phoneNumber || '+919999999999';

            const response = await this.externalClient.sendSMS(phoneNumber, message);

            await this.notificationRepository.createNotification({
                user_id: userId,
                type: 'SMS',
                status: response.success ? 'SENT' : 'FAILED',
                content: { message, phoneNumber },
                error_message: response.success ? undefined : response.message
            });

            logger.info('Notification processed for loan.created');
        } catch (error: any) {
            logger.error('Error sending notification for loan.created', { error });
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
