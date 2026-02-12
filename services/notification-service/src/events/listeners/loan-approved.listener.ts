import { ConsumeMessage } from 'amqplib';
import { BaseListener } from './base-listener.js';
import { logger } from '@platform/common';
import { NotificationRepository } from '../../repositories/notification.repository.js';
import { ExternalGrpcClient } from '../../grpc/client.js';
import { config } from '../../config/index.js';

export class LoanApprovedListener extends BaseListener {
    queue = 'notification-service-loan-approved';
    exchange = 'loan_events';
    routingKey = 'loan.approved';

    private notificationRepository = new NotificationRepository();
    private externalClient = new ExternalGrpcClient(config.externalServiceGrpcUrl);

    async onMessage(data: any, msg: ConsumeMessage) {
        const { loanId, userId, amount } = data;

        if (!userId) {
            logger.error('Missing userId in loan.approved event');
            return;
        }

        const message = `Congratulations! Your loan of ₹${amount} has been approved. Loan ID: ${loanId}`;

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
            logger.error('Error sending notification for loan.approved', { error });
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
