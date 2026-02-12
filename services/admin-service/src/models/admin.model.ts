import { db } from '@platform/common';

export interface AdminAudit {
    id?: number;
    admin_id: string;
    action: string;
    details: any;
    created_at?: Date;
}

export class AdminModel {
    static async createAuditLog(audit: AdminAudit): Promise<AdminAudit> {
        const query = `
            INSERT INTO admin_schema.audit_logs (admin_id, action, details)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [audit.admin_id, audit.action, audit.details];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async init(): Promise<void> {
        const queries = [
            `CREATE TABLE IF NOT EXISTS admin_schema.audit_logs (
                id SERIAL PRIMARY KEY,
                admin_id VARCHAR(255) NOT NULL,
                action VARCHAR(255) NOT NULL,
                details JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS admin_schema.dashboard_stats (
                key VARCHAR(255) PRIMARY KEY,
                value INT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const query of queries) {
            await db.query(query);
        }

        // Initialize stats if not exist
        await db.query(`INSERT INTO admin_schema.dashboard_stats (key, value) VALUES ('total_loans', 0) ON CONFLICT DO NOTHING`);
        await db.query(`INSERT INTO admin_schema.dashboard_stats (key, value) VALUES ('total_users', 0) ON CONFLICT DO NOTHING`);
    }

    static async incrementStat(key: string): Promise<void> {
        const query = `
            INSERT INTO admin_schema.dashboard_stats (key, value)
            VALUES ($1, 1)
            ON CONFLICT (key) DO UPDATE SET value = admin_schema.dashboard_stats.value + 1, updated_at = CURRENT_TIMESTAMP
        `;
        await db.query(query, [key]);
    }
}
