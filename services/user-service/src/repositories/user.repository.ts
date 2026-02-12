import { db } from '@platform/common';
import { UserProfileDoc } from '../models/user.model';

export class UserRepository {
    private static readonly SCHEMA = 'user_schema';
    private static readonly TABLE = 'profiles';

    async createTable(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS ${UserRepository.SCHEMA}.${UserRepository.TABLE} (
                id UUID PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone_number VARCHAR(20),
                date_of_birth DATE,
                gender VARCHAR(20),
                address JSONB,
                bank_details JSONB,
                pan_number VARCHAR(20),
                aadhaar_number VARCHAR(20),
                kyc_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.query(query);
    }

    async findById(id: string): Promise<UserProfileDoc | null> {
        const query = `
            SELECT * FROM ${UserRepository.SCHEMA}.${UserRepository.TABLE}
            WHERE id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByEmail(email: string): Promise<UserProfileDoc | null> {
        const query = `
            SELECT * FROM ${UserRepository.SCHEMA}.${UserRepository.TABLE}
            WHERE email = $1
        `;
        const result = await db.query(query, [email]);
        return result.rows[0] || null;
    }

    async create(user: Partial<UserProfileDoc>): Promise<UserProfileDoc> {
        const keys = Object.keys(user);
        const values = Object.values(user);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        const columns = keys.join(', ');

        const query = `
            INSERT INTO ${UserRepository.SCHEMA}.${UserRepository.TABLE} (${columns})
            VALUES (${placeholders})
            RETURNING *
        `;
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async update(id: string, updates: Partial<UserProfileDoc>): Promise<UserProfileDoc | null> {
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

        const query = `
            UPDATE ${UserRepository.SCHEMA}.${UserRepository.TABLE}
            SET ${setClause}, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [id, ...values]);
        return result.rows[0] || null;
    }
}
