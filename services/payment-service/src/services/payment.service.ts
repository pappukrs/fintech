import { v4 as uuidv4 } from 'uuid';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentEventPublisher } from '../events/publishers/payment.publisher';
import { PaymentDoc, PaymentStatus } from '../models/payment.model';
import { BadRequestError } from '@platform/common';

export class PaymentService {
    private paymentRepository: PaymentRepository;
    private eventPublisher: PaymentEventPublisher;

    constructor() {
        this.paymentRepository = new PaymentRepository();
        this.eventPublisher = new PaymentEventPublisher();
    }

    async init() {
        await this.paymentRepository.createTable();
        await this.eventPublisher.setup();
    }

    async initiatePayment(userId: string, loanId: string, amount: number, emiId?: string): Promise<PaymentDoc> {
        // In a real scenario, we would call the External Service here to get a payment link/session
        // For now, we generate a mock orderId
        const orderId = `ORDER_${uuidv4().substring(0, 8).toUpperCase()}`;

        const payment = await this.paymentRepository.create({
            order_id: orderId,
            user_id: userId,
            loan_id: loanId,
            emi_id: emiId,
            amount,
            status: PaymentStatus.PENDING,
            provider: 'CASHFREE'
        });

        await this.eventPublisher.publishPaymentCreated(
            payment.id,
            payment.order_id,
            payment.user_id,
            payment.amount
        );

        return payment;
    }

    async handleWebhook(orderId: string, status: string, transactionId: string, method: string): Promise<PaymentDoc> {
        const payment = await this.paymentRepository.findByOrderId(orderId);

        if (!payment) {
            throw new BadRequestError('Payment not found');
        }

        if (payment.status !== PaymentStatus.PENDING) {
            return payment; // Already processed
        }

        let newStatus: PaymentStatus;
        if (status === 'SUCCESS') {
            newStatus = PaymentStatus.COMPLETED;
        } else if (status === 'FAILED') {
            newStatus = PaymentStatus.FAILED;
        } else {
            return payment; // Ignore other statuses for now
        }

        const updatedPayment = await this.paymentRepository.updateStatus(
            payment.id,
            newStatus,
            transactionId,
            method
        );

        if (!updatedPayment) {
            throw new Error('Failed to update payment status');
        }

        if (newStatus === PaymentStatus.COMPLETED) {
            await this.eventPublisher.publishPaymentCompleted(
                updatedPayment.id,
                updatedPayment.order_id,
                updatedPayment.user_id,
                updatedPayment.amount,
                updatedPayment.loan_id,
                updatedPayment.emi_id
            );
        } else if (newStatus === PaymentStatus.FAILED) {
            await this.eventPublisher.publishPaymentFailed(
                updatedPayment.id,
                updatedPayment.order_id,
                updatedPayment.user_id,
                'Payment failed from gateway'
            );
        }

        return updatedPayment;
    }

    async getPayment(id: string): Promise<PaymentDoc | null> {
        return this.paymentRepository.findById(id);
    }

    async getPaymentsByLoan(loanId: string): Promise<PaymentDoc[]> {
        return this.paymentRepository.findByLoanId(loanId);
    }
}
