export enum LoanStatus {
    APPLIED = 'APPLIED',
    VERIFIED = 'VERIFIED', // User verified
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    DISBURSED = 'DISBURSED',
    PAID = 'PAID',
    DEFAULTED = 'DEFAULTED',
}

export interface LoanDoc {
    id: string; // UUID
    user_id: string; // UUID from User Service
    amount: number;
    interest_rate: number;
    tenure_months: number;
    status: LoanStatus;
    reason?: string; // For rejection
    created_at: Date;
    updated_at: Date;
}
