import { db } from '@platform/common';
import { PaymentDoc, PaymentStatus } from '../models/payment.model';

export class PaymentRepository {
    private static readonly SCHEMA = 'payment_schema';
    private static readonly TABLE = 'payments';

    async createTable(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS ${PaymentRepository.SCHEMA}.${PaymentRepository.TABLE} (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id VARCHAR(255) UNIQUE NOT NULL,
                user_id UUID NOT NULL,
                loan_id UUID NOT NULL,
                emi_id UUID,
                amount DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'INR',
                status VARCHAR(20) NOT NULL,
                method VARCHAR(50),
                provider VARCHAR(50),
                transaction_id VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.query(query);
    }

    async create(payment: Partial<PaymentDoc>): Promise<PaymentDoc> {
        const query = `
            INSERT INTO ${PaymentRepository.SCHEMA}.${PaymentRepository.TABLE} 
            (order_id, user_id, loan_id, emi_id, amount, currency, status, provider)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const result = await db.query(query, [
            payment.order_id,
            payment.user_id,
            payment.loan_id,
            payment.emi_id || null,
            payment.amount,
            payment.currency || 'INR',
            payment.status || PaymentStatus.PENDING,
            payment.provider || 'CASHFREE'
        ]);
        return result.rows[0];
    }

    async findById(id: string): Promise<PaymentDoc | null> {
        const query = `
            SELECT * FROM ${PaymentRepository.SCHEMA}.${PaymentRepository.TABLE}
            WHERE id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByOrderId(orderId: string): Promise<PaymentDoc | null> {
        const query = `
            SELECT * FROM ${PaymentRepository.SCHEMA}.${PaymentRepository.TABLE}
            WHERE order_id = $1
        `;
        const result = await db.query(query, [orderId]);
        return result.rows[0] || null;
    }

    async updateStatus(
        id: string,
        status: PaymentStatus,
        transactionId?: string,
        method?: string
    ): Promise<PaymentDoc | null> {
        const query = `
            UPDATE ${PaymentRepository.SCHEMA}.${PaymentRepository.TABLE}
            SET status = $2, transaction_id = COALESCE($3, transaction_id), method = COALESCE($4, method), updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [id, status, transactionId || null, method || null]);
        return result.rows[0] || null;
    }

    async findByLoanId(loanId: string): Promise<PaymentDoc[]> {
        const query = `
            SELECT * FROM ${PaymentRepository.SCHEMA}.${PaymentRepository.TABLE}
            WHERE loan_id = $1
            ORDER BY created_at DESC
        `;
        const result = await db.query(query, [loanId]);
        return result.rows;
    }
}
