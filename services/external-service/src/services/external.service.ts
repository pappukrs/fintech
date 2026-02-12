import { ExternalRepository, VerificationLog, PaymentTransaction } from '../repositories/external.repository.js';
import { IVendorAdapter } from '../adapters/vendor-adapter.interface.js';
import { MockVendorAdapter } from '../adapters/mock-vendor.adapter.js';
import { CashfreeAdapter } from '../adapters/cashfree.adapter.js';
import { ExternalEventPublisher } from '../events/external-publisher.js';
import { logger } from '@platform/common';

export class ExternalService {
    private repository: ExternalRepository;
    private adapter: IVendorAdapter;
    private publisher: ExternalEventPublisher;

    constructor() {
        this.repository = new ExternalRepository();
        this.publisher = new ExternalEventPublisher();
        // Use Cashfree for payments/verifications if keys are provided, else Mock
        this.adapter = process.env.CASHFREE_APP_ID ? new CashfreeAdapter() : new MockVendorAdapter();
    }

    async init() {
        await this.publisher.setup();
    }

    async verifyPAN(userId: string, pan: string, name: string) {
        logger.info(`Processing PAN verification for user ${userId}`);

        const log: VerificationLog = await this.repository.createVerificationLog({
            user_id: userId,
            verification_type: 'PAN',
            id_number: pan,
            status: 'PENDING',
            provider: 'MOCK',
            request_payload: { pan, name }
        });

        try {
            const result = await this.adapter.verifyPAN(pan, name);

            await this.repository.updateVerificationLog(log.id!, {
                status: result.success ? 'SUCCESS' : 'FAILED',
                provider_reference: result.provider_reference,
                response_payload: result.response_payload,
                error_message: result.success ? undefined : result.message
            });

            if (result.success) {
                await this.publisher.publishVerificationCompleted(userId, 'PAN', 'SUCCESS', 'CASHFREE', result.provider_reference);
            }

            return result;
        } catch (error: any) {
            logger.error(`PAN verification failed: ${error.message}`);
            await this.repository.updateVerificationLog(log.id!, {
                status: 'FAILED',
                error_message: error.message
            });
            throw error;
        }
    }

    async verifyAadhaar(userId: string, aadhaar: string) {
        logger.info(`Processing Aadhaar verification for user ${userId}`);

        const log = await this.repository.createVerificationLog({
            user_id: userId,
            verification_type: 'AADHAAR',
            id_number: aadhaar,
            status: 'PENDING',
            provider: 'MOCK',
            request_payload: { aadhaar }
        });

        try {
            const result = await this.adapter.verifyAadhaar(aadhaar);
            await this.repository.updateVerificationLog(log.id!, {
                status: result.success ? 'SUCCESS' : 'FAILED',
                provider_reference: result.provider_reference,
                response_payload: result.response_payload,
                error_message: result.success ? undefined : result.message
            });
            return result;
        } catch (error: any) {
            await this.repository.updateVerificationLog(log.id!, {
                status: 'FAILED',
                error_message: error.message
            });
            throw error;
        }
    }

    async verifyBank(userId: string, account: string, ifsc: string, name: string) {
        logger.info(`Processing Bank verification for user ${userId}`);

        const log = await this.repository.createVerificationLog({
            user_id: userId,
            verification_type: 'BANK',
            id_number: account,
            status: 'PENDING',
            provider: 'MOCK',
            request_payload: { account, ifsc, name }
        });

        try {
            const result = await this.adapter.verifyBankAccount(account, ifsc, name);
            await this.repository.updateVerificationLog(log.id!, {
                status: result.success ? 'SUCCESS' : 'FAILED',
                provider_reference: result.provider_reference,
                response_payload: result.response_payload,
                error_message: result.success ? undefined : result.message
            });
            return result;
        } catch (error: any) {
            await this.repository.updateVerificationLog(log.id!, {
                status: 'FAILED',
                error_message: error.message
            });
            throw error;
        }
    }

    async initializePayment(userId: string, data: any) {
        logger.info(`Initializing payment for user ${userId}, order ${data.order_id}`);

        const tx = await this.repository.createPaymentTransaction({
            user_id: userId,
            order_id: data.order_id,
            amount: data.amount,
            currency: data.currency || 'INR',
            status: 'PENDING',
            provider: 'MOCK'
        });

        try {
            const result = await this.adapter.initializePayment(data);
            if (result.success) {
                await this.repository.updatePaymentTransaction(data.order_id, {
                    payment_session_id: result.payment_session_id,
                    payment_url: result.payment_url,
                    provider_reference: result.provider_reference
                });
            } else {
                await this.repository.updatePaymentTransaction(data.order_id, {
                    status: 'FAILED'
                });
            }
            return result;
        } catch (error: any) {
            await this.repository.updatePaymentTransaction(data.order_id, {
                status: 'FAILED'
            });
            throw error;
        }
    }

    async getPaymentStatus(orderId: string) {
        const result = await this.adapter.getPaymentStatus(orderId);
        if (result.success) {
            await this.repository.updatePaymentTransaction(orderId, {
                status: result.status,
                provider_reference: result.provider_reference,
                callback_payload: result.callback_payload
            });

            await this.publisher.publishPaymentStatusUpdated(orderId, result.status, 'CASHFREE', result.provider_reference);
        }
        return result;
    }
}
