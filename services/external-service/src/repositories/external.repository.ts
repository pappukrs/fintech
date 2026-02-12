import { db } from '@platform/common';

export interface VerificationLog {
    id?: string;
    user_id: string;
    verification_type: string;
    id_number?: string;
    status: string;
    provider?: string;
    provider_reference?: string;
    request_payload?: any;
    response_payload?: any;
    error_message?: string;
}

export interface PaymentTransaction {
    id?: string;
    user_id: string;
    order_id: string;
    amount: number;
    currency?: string;
    status: string;
    payment_session_id?: string;
    payment_url?: string;
    provider?: string;
    provider_reference?: string;
    callback_payload?: any;
}

export class ExternalRepository {
    async createVerificationLog(log: VerificationLog): Promise<VerificationLog> {
        const query = `
            INSERT INTO external_schema.verification_logs 
            (user_id, verification_type, id_number, status, provider, provider_reference, request_payload, response_payload, error_message)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            log.user_id,
            log.verification_type,
            log.id_number,
            log.status,
            log.provider,
            log.provider_reference,
            JSON.stringify(log.request_payload),
            JSON.stringify(log.response_payload),
            log.error_message
        ];
        const res = await db.query(query, values);
        return res.rows[0];
    }

    async updateVerificationLog(id: string, log: Partial<VerificationLog>): Promise<void> {
        const fields = Object.keys(log);
        const values = Object.values(log).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
        const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
        const query = `UPDATE external_schema.verification_logs SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`;
        await db.query(query, [id, ...values]);
    }

    async createPaymentTransaction(tx: PaymentTransaction): Promise<PaymentTransaction> {
        const query = `
            INSERT INTO external_schema.payment_transactions 
            (user_id, order_id, amount, currency, status, payment_session_id, payment_url, provider, provider_reference)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            tx.user_id,
            tx.order_id,
            tx.amount,
            tx.currency || 'INR',
            tx.status,
            tx.payment_session_id,
            tx.payment_url,
            tx.provider,
            tx.provider_reference
        ];
        const res = await db.query(query, values);
        return res.rows[0];
    }

    async updatePaymentTransaction(order_id: string, update: Partial<PaymentTransaction>): Promise<void> {
        const fields = Object.keys(update);
        const values = Object.values(update).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
        const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
        const query = `UPDATE external_schema.payment_transactions SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE order_id = $1`;
        await db.query(query, [order_id, ...values]);
    }

    async getPaymentTransaction(order_id: string): Promise<PaymentTransaction | null> {
        const query = 'SELECT * FROM external_schema.payment_transactions WHERE order_id = $1';
        const res = await db.query(query, [order_id]);
        return res.rows[0] || null;
    }
}
