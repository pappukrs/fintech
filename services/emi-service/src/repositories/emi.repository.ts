import { db } from '@platform/common';
import { EmiDoc, EmiStatus } from '../models/emi.model';

export class EmiRepository {
    private static readonly SCHEMA = 'emi_schema';
    private static readonly TABLE = 'emis';

    async createTable(): Promise<void> {
        const query = `
            CREATE SCHEMA IF NOT EXISTS ${EmiRepository.SCHEMA};
            CREATE TABLE IF NOT EXISTS ${EmiRepository.SCHEMA}.${EmiRepository.TABLE} (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                loan_id UUID NOT NULL,
                user_id UUID NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                due_date TIMESTAMP NOT NULL,
                status VARCHAR(20) DEFAULT 'PENDING',
                payment_date TIMESTAMP,
                penalty_amount DECIMAL(10, 2) DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_emis_loan_id ON ${EmiRepository.SCHEMA}.${EmiRepository.TABLE}(loan_id);
            CREATE INDEX IF NOT EXISTS idx_emis_user_id ON ${EmiRepository.SCHEMA}.${EmiRepository.TABLE}(user_id);
            CREATE INDEX IF NOT EXISTS idx_emis_status ON ${EmiRepository.SCHEMA}.${EmiRepository.TABLE}(status);
            CREATE INDEX IF NOT EXISTS idx_emis_due_date ON ${EmiRepository.SCHEMA}.${EmiRepository.TABLE}(due_date);
        `;
        await db.query(query);
    }

    async create(emi: Partial<EmiDoc>): Promise<EmiDoc> {
        const keys = Object.keys(emi);
        const values = Object.values(emi);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        const columns = keys.join(', ');

        const query = `
            INSERT INTO ${EmiRepository.SCHEMA}.${EmiRepository.TABLE} (${columns})
            VALUES (${placeholders})
            RETURNING *
        `;
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async createBulk(emis: Partial<EmiDoc>[]): Promise<EmiDoc[]> {
        if (emis.length === 0) return [];

        // This is a simple loop implementation. For performance, we could use a single INSERT statement with multiple values.
        // Assuming the loan schedule is usually 12-60 EMIs, a transaction with a loop is acceptable for now.
        const createdEmis: EmiDoc[] = [];

        // We'll trust the business logic to wrap this in a transaction if needed, 
        // but ideally we should provide a transactional method.
        // For now, simple loop.
        for (const emi of emis) {
            createdEmis.push(await this.create(emi));
        }

        return createdEmis;
    }

    async findByLoanId(loanId: string): Promise<EmiDoc[]> {
        const query = `
            SELECT * FROM ${EmiRepository.SCHEMA}.${EmiRepository.TABLE}
            WHERE loan_id = $1
            ORDER BY due_date ASC
        `;
        const result = await db.query(query, [loanId]);
        return result.rows;
    }

    async findByUserId(userId: string): Promise<EmiDoc[]> {
        const query = `
            SELECT * FROM ${EmiRepository.SCHEMA}.${EmiRepository.TABLE}
            WHERE user_id = $1
            ORDER BY due_date ASC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    async findById(id: string): Promise<EmiDoc | null> {
        const query = `
            SELECT * FROM ${EmiRepository.SCHEMA}.${EmiRepository.TABLE}
            WHERE id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    async updateStatus(id: string, status: EmiStatus, paymentDate?: Date): Promise<EmiDoc | null> {
        const query = `
            UPDATE ${EmiRepository.SCHEMA}.${EmiRepository.TABLE}
            SET status = $2, payment_date = $3, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [id, status, paymentDate || null]);
        return result.rows[0] || null;
    }
}
