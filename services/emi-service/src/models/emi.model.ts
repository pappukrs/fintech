export enum EmiStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE'
}

export interface EmiDoc {
    id: string;
    loan_id: string;
    user_id: string;
    amount: number;
    due_date: Date;
    status: EmiStatus;
    payment_date?: Date;
    penalty_amount: number;
    created_at: Date;
    updated_at: Date;
}
