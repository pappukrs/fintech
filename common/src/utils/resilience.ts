import CircuitBreaker from 'opossum';
import logger from '../logger';

const options = {
    timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
    resetTimeout: 30000 // After 30 seconds, try again.
};

export const createCircuitBreaker = (action: (...args: any[]) => Promise<any>) => {
    const breaker = new CircuitBreaker(action, options);

    breaker.on('open', () => logger.warn('Circuit Breaker Opened'));
    breaker.on('halfOpen', () => logger.info('Circuit Breaker Half-Open'));
    breaker.on('close', () => logger.info('Circuit Breaker Closed'));
    breaker.on('fallback', () => logger.error('Circuit Breaker Fallback Triggered'));

    return breaker;
};

export const retry = async <T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        logger.warn(`Retrying operation... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay * 2);
    }
};
