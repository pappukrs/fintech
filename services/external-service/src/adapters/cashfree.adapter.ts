import axios from 'axios';
import { IVendorAdapter, VerificationResult, PaymentInitializationResult, PaymentStatusResult } from './vendor-adapter.interface.js';
import { logger } from '@platform/common';

export class CashfreeAdapter implements IVendorAdapter {
    private appId: string;
    private secretKey: string;
    private baseUrl: string;

    constructor() {
        this.appId = process.env.CASHFREE_APP_ID || '';
        this.secretKey = process.env.CASHFREE_SECRET_KEY || '';
        this.baseUrl = process.env.NODE_ENV === 'production'
            ? 'https://api.cashfree.com/pg'
            : 'https://sandbox.cashfree.com/pg';
    }

    private getHeaders() {
        return {
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
            'x-api-version': '2022-09-01',
            'Content-Type': 'application/json'
        };
    }

    async verifyPAN(pan: string, name: string): Promise<VerificationResult> {
        // Cashfree has a separate Verification API, but assuming we use PG for now or mock it if not available
        logger.info(`Cashfree: Verifying PAN ${pan}`);
        // In a real scenario, we'd call Cashfree Verification API
        return {
            success: true,
            message: 'PAN verified (Mocked via CashfreeAdapter)',
            provider_reference: 'CF_PAN_123456',
            response_payload: { status: 'VALID' }
        };
    }

    async verifyAadhaar(aadhaar: string): Promise<VerificationResult> {
        logger.info(`Cashfree: Verifying Aadhaar ${aadhaar}`);
        return {
            success: true,
            message: 'Aadhaar verified (Mocked via CashfreeAdapter)',
            provider_reference: 'CF_AAD_123456'
        };
    }

    async verifyBankAccount(account: string, ifsc: string, name: string): Promise<VerificationResult> {
        logger.info(`Cashfree: Verifying Bank Account ${account}`);
        return {
            success: true,
            message: 'Bank account verified (Mocked via CashfreeAdapter)',
            provider_reference: 'CF_BANK_123456'
        };
    }

    async initializePayment(data: any): Promise<PaymentInitializationResult> {
        try {
            const response = await axios.post(`${this.baseUrl}/orders`, {
                order_id: data.order_id,
                order_amount: data.amount,
                order_currency: data.currency || 'INR',
                customer_details: {
                    customer_id: data.user_id,
                    customer_phone: data.customer_phone,
                    customer_email: data.customer_email
                }
            }, { headers: this.getHeaders() });

            const { payment_session_id, order_status } = response.data;

            return {
                success: true,
                message: 'Order created',
                payment_session_id,
                payment_url: `https://test.cashfree.com/billpay/checkout/post/submit?session_id=${payment_session_id}`, // In real life, use the response url or session id
                order_id: data.order_id,
                status: order_status
            };
        } catch (error: any) {
            logger.error(`Cashfree Order Initialization Failed: ${error.response?.data?.message || error.message}`);
            return {
                success: false,
                message: error.response?.data?.message || error.message,
                order_id: data.order_id
            };
        }
    }

    async getPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
        try {
            const response = await axios.get(`${this.baseUrl}/orders/${orderId}`, {
                headers: this.getHeaders()
            });

            const { order_status, cf_order_id } = response.data;

            let status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' = 'PENDING';
            if (order_status === 'PAID') status = 'SUCCESS';
            else if (order_status === 'FAILED') status = 'FAILED';
            else if (order_status === 'CANCELLED') status = 'CANCELLED';

            return {
                success: true,
                message: `Order status: ${order_status}`,
                status,
                provider_reference: cf_order_id.toString(),
                callback_payload: response.data
            };
        } catch (error: any) {
            logger.error(`Cashfree Order Status Fetch Failed: ${error.response?.data?.message || error.message}`);
            return {
                success: false,
                message: error.response?.data?.message || error.message,
                status: 'FAILED'
            };
        }
    }
}
