import { Pool } from 'pg';
declare class DatabaseManager {
    private pool;
    private static instance;
    private constructor();
    static getInstance(): DatabaseManager;
    connect(connectionString: string): Promise<void>;
    getPool(): Pool;
    close(): Promise<void>;
    query(text: string, params?: any[]): Promise<import("pg").QueryResult<any>>;
}
export declare const db: DatabaseManager;
export {};
//# sourceMappingURL=index.d.ts.map