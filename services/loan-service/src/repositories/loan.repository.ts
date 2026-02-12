import { db } from '@platform/common';
import { LoanDoc, LoanStatus } from '../models/loan.model';

export class LoanRepository {
    private static readonly SCHEMA = 'loan_schema';
    private static readonly TABLE = 'loans';

    async createTable(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS ${LoanRepository.SCHEMA}.${LoanRepository.TABLE} (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                interest_rate DECIMAL(5, 2) NOT NULL,
                tenure_months INTEGER NOT NULL,
                status VARCHAR(20) NOT NULL,
                reason TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.query(query);
    }

    async create(loan: Partial<LoanDoc>): Promise<LoanDoc> {
        const query = `
            INSERT INTO ${LoanRepository.SCHEMA}.${LoanRepository.TABLE} 
            (user_id, amount, interest_rate, tenure_months, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await db.query(query, [
            loan.user_id,
            loan.amount,
            loan.interest_rate,
            loan.tenure_months,
            loan.status || LoanStatus.APPLIED
        ]);
        return result.rows[0];
    }

    async findById(id: string): Promise<LoanDoc | null> {
        const query = `
            SELECT * FROM ${LoanRepository.SCHEMA}.${LoanRepository.TABLE}
            WHERE id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByUserId(userId: string): Promise<LoanDoc[]> {
        const query = `
            SELECT * FROM ${LoanRepository.SCHEMA}.${LoanRepository.TABLE}
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    async updateStatus(id: string, status: LoanStatus, reason?: string): Promise<LoanDoc | null> {
        let query = `
            UPDATE ${LoanRepository.SCHEMA}.${LoanRepository.TABLE}
            SET status = $2, updated_at = NOW()
        `;
        const params: any[] = [id, status];

        if (reason) {
            query += `, reason = $3`;
            params.push(reason);
        }

        query += ` WHERE id = $1 RETURNING *`;

        const result = await db.query(query, params);
        return result.rows[0] || null;
    }
}
