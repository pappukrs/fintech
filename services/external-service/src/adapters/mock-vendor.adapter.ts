import { IVendorAdapter, VerificationResult, PaymentInitializationResult, PaymentStatusResult } from './vendor-adapter.interface.js';
import { v4 as uuidv4 } from 'uuid';

export class MockVendorAdapter implements IVendorAdapter {
    async verifyPAN(pan: string, name: string): Promise<VerificationResult> {
        console.log(`Mock: Verifying PAN ${pan} for ${name}`);
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            success: true,
            message: 'PAN verified successfully',
            provider_reference: `MOCK_PAN_${uuidv4().substring(0, 8)}`,
            response_payload: { status: 'VALID', name_match: true }
        };
    }

    async verifyAadhaar(aadhaar: string): Promise<VerificationResult> {
        console.log(`Mock: Verifying Aadhaar ${aadhaar}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            message: 'Aadhaar verified successfully',
            provider_reference: `MOCK_AAD_${uuidv4().substring(0, 8)}`,
            response_payload: { status: 'VALID' }
        };
    }

    async verifyBankAccount(account: string, ifsc: string, name: string): Promise<VerificationResult> {
        console.log(`Mock: Verifying Bank Account ${account} at ${ifsc} for ${name}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            message: 'Bank account verified successfully',
            provider_reference: `MOCK_BANK_${uuidv4().substring(0, 8)}`,
            response_payload: { status: 'VALID', account_status: 'ACTIVE' }
        };
    }

    async initializePayment(data: any): Promise<PaymentInitializationResult> {
        console.log(`Mock: Initializing payment for order ${data.order_id} of amount ${data.amount}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            message: 'Payment initialized',
            payment_session_id: `MOCK_SESS_${uuidv4()}`,
            payment_url: `https://test.cashfree.com/billpay/checkout/post/submit?session_id=MOCK_SESS_${uuidv4()}`,
            order_id: data.order_id,
            provider_reference: `MOCK_ORDER_${uuidv4().substring(0, 8)}`
        };
    }

    async getPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
        console.log(`Mock: Fetching status for order ${orderId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            message: 'Payment status fetched',
            status: 'SUCCESS',
            provider_reference: `MOCK_TX_${uuidv4().substring(0, 8)}`,
            callback_payload: { amount: 1000, status: 'PAID' }
        };
    }
}
