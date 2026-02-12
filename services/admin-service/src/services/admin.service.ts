import { db } from '@platform/common';

export class AdminService {
    // Aggregates data from other services via DB/Events view or direct DB access (strictly read-only if policy allows, otherwise via events)
    // For this architecture, we usually prefer event-built local views or calling other services.
    // However, often admin dashboards might need direct read access to other schemas for reporting if allowed,
    // OR it should digest events into its own schema.
    // Given strict "No cross-service DB queries" rule, we must rely on:
    // 1. Stored analytics data from events (RabbitMQ consumers)
    // 2. Real-time calls to other services (HTTP/gRPC) - maybe too slow for dashboard
    // 3. For simple "Counts", we can query our local 'analytics' tables populated by events.

    // Let's implement a basic version where it returns mocked/static data or queries its own audit logs for now.
    // And assuming we have some event consumers populating 'admin_schema.daily_stats'.

    static async getDashboardStats() {
        const statsQuery = `SELECT key, value FROM admin_schema.dashboard_stats`;
        const statsRes = await db.query(statsQuery);

        const auditQuery = `SELECT COUNT(*) as processed_count FROM admin_schema.audit_logs`;
        const auditRes = await db.query(auditQuery);

        const stats: any = {
            processedLoansByAdmins: parseInt(auditRes.rows[0].processed_count) || 0
        };

        statsRes.rows.forEach((row: any) => {
            stats[row.key] = row.value;
        });

        return stats;
    }
}
