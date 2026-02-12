"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
const logger_1 = __importDefault(require("../logger"));
class DatabaseManager {
    pool = null;
    static instance;
    constructor() { }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    async connect(connectionString) {
        try {
            this.pool = new pg_1.Pool({
                connectionString,
            });
            // Test connection
            await this.pool.query('SELECT NOW()');
            logger_1.default.info('Connected to PostgreSQL successfully');
        }
        catch (error) {
            logger_1.default.error('Failed to connect to PostgreSQL', { error });
            throw error;
        }
    }
    getPool() {
        if (!this.pool) {
            throw new Error('Database pool not initialized. Call connect() first.');
        }
        return this.pool;
    }
    async close() {
        if (this.pool) {
            await this.pool.end();
            logger_1.default.info('PostgreSQL connection pool closed');
        }
    }
    async query(text, params) {
        return this.getPool().query(text, params);
    }
}
exports.db = DatabaseManager.getInstance();
//# sourceMappingURL=index.js.map