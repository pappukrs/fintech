import { db } from '@platform/common';

export class NotificationRepository {
    async createTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS notification_schema.notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                type VARCHAR(50) NOT NULL, -- 'SMS', 'EMAIL', 'PUSH'
                status VARCHAR(50) NOT NULL, -- 'SENT', 'FAILED', 'PENDING'
                content JSONB NOT NULL,
                external_id VARCHAR(255),
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.query(query);
    }

    async createNotification(data: {
        user_id: string;
        type: string;
        status: string;
        content: any;
        external_id?: string;
        error_message?: string;
    }) {
        const query = `
            INSERT INTO notification_schema.notifications (user_id, type, status, content, external_id, error_message)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [
            data.user_id,
            data.type,
            data.status,
            JSON.stringify(data.content),
            data.external_id,
            data.error_message
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }
}
