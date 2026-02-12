export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

export interface PaymentDoc {
    id: string;
    order_id: string; // From payment gateway
    user_id: string;
    loan_id: string;
    emi_id?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method?: string; // UPI, CARD, etc.
    provider?: string; // CASHFREE, etc.
    transaction_id?: string; // From gateway
    created_at: Date;
    updated_at: Date;
}
