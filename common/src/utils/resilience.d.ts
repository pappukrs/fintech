import CircuitBreaker from 'opossum';
export declare const createCircuitBreaker: (action: (...args: any[]) => Promise<any>) => CircuitBreaker<any[], any>;
export declare const retry: <T>(fn: () => Promise<T>, retries?: number, delay?: number) => Promise<T>;
//# sourceMappingURL=resilience.d.ts.map