"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = exports.createCircuitBreaker = void 0;
const opossum_1 = __importDefault(require("opossum"));
const logger_1 = __importDefault(require("../logger"));
const options = {
    timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
    resetTimeout: 30000 // After 30 seconds, try again.
};
const createCircuitBreaker = (action) => {
    const breaker = new opossum_1.default(action, options);
    breaker.on('open', () => logger_1.default.warn('Circuit Breaker Opened'));
    breaker.on('halfOpen', () => logger_1.default.info('Circuit Breaker Half-Open'));
    breaker.on('close', () => logger_1.default.info('Circuit Breaker Closed'));
    breaker.on('fallback', () => logger_1.default.error('Circuit Breaker Fallback Triggered'));
    return breaker;
};
exports.createCircuitBreaker = createCircuitBreaker;
const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    }
    catch (error) {
        if (retries <= 0)
            throw error;
        logger_1.default.warn(`Retrying operation... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return (0, exports.retry)(fn, retries - 1, delay * 2);
    }
};
exports.retry = retry;
//# sourceMappingURL=resilience.js.map