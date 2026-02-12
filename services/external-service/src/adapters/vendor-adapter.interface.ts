export interface VerificationResult {
    success: boolean;
    message: string;
    provider_reference?: string;
    response_payload?: any;
}

export interface PaymentInitializationResult {
    success: boolean;
    message: string;
    payment_session_id?: string;
    payment_url?: string;
    order_id: string;
    provider_reference?: string;
    status?: string;
}

export interface PaymentStatusResult {
    success: boolean;
    message: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    provider_reference?: string;
    callback_payload?: any;
}

export interface IVendorAdapter {
    verifyPAN(pan: string, name: string): Promise<VerificationResult>;
    verifyAadhaar(aadhaar: string): Promise<VerificationResult>;
    verifyBankAccount(account: string, ifsc: string, name: string): Promise<VerificationResult>;
    initializePayment(data: any): Promise<PaymentInitializationResult>;
    getPaymentStatus(orderId: string): Promise<PaymentStatusResult>;
}
