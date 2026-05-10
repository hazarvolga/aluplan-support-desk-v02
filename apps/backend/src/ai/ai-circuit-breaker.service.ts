import { Injectable, Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';

export interface CircuitBreakerOptions {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    volumeThreshold?: number;
}

const DEFAULT_OPTIONS: Required<CircuitBreakerOptions> = {
    timeout: 120_000,
    errorThresholdPercentage: 50,
    resetTimeout: 30_000,
    volumeThreshold: 5,
};

/**
 * Centralized Circuit Breaker Management
 * 
 * Reduces AiService complexity by extracting circuit breaker logic.
 * Manages breakers for all AI providers in one place.
 */
@Injectable()
export class AiCircuitBreakerService {
    private readonly logger = new Logger(AiCircuitBreakerService.name);
    private readonly breakers = new Map<string, CircuitBreaker>();
    private readonly options: Required<CircuitBreakerOptions>;

    constructor(options?: CircuitBreakerOptions) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }

    /**
     * Get or create a circuit breaker for a provider
     */
    getBreaker(providerName: string): CircuitBreaker {
        if (!this.breakers.has(providerName)) {
            const breaker = new CircuitBreaker(
                async (fn: () => Promise<any>) => await fn(),
                {
                    timeout: this.options.timeout,
                    errorThresholdPercentage: this.options.errorThresholdPercentage,
                    resetTimeout: this.options.resetTimeout,
                    volumeThreshold: this.options.volumeThreshold,
                }
            );

            breaker.on('open', () => 
                this.logger.error(`🚨 Circuit Breaker OPENED for ${providerName}`)
            );
            breaker.on('halfOpen', () => 
                this.logger.warn(`⚠️ Circuit Breaker HALF-OPEN for ${providerName}`)
            );
            breaker.on('close', () => 
                this.logger.log(`✅ Circuit Breaker CLOSED for ${providerName}`)
            );

            this.breakers.set(providerName, breaker);
            this.logger.log(`Created circuit breaker for provider: ${providerName}`);
        }

        return this.breakers.get(providerName)!;
    }

    /**
     * Execute an operation with circuit breaker protection
     */
    async executeWithBreaker<T>(
        providerName: string,
        operation: () => Promise<T>
    ): Promise<T> {
        const breaker = this.getBreaker(providerName);
        return await breaker.fire(operation) as T;
    }

    /**
     * Check if a breaker is in open state
     */
    isOpen(providerName: string): boolean {
        const breaker = this.breakers.get(providerName);
        const breakerStatus = breaker?.status as { isOpen?: boolean } | undefined;
        return breakerStatus?.isOpen ?? false;
    }

    /**
     * Get status of all breakers
     */
    getStatus(): Record<string, { isOpen: boolean; isClosed: boolean; isHalfOpen: boolean }> {
        const status: Record<string, { isOpen: boolean; isClosed: boolean; isHalfOpen: boolean }> = {};
        
        for (const [name, breaker] of this.breakers) {
            const breakerStatus = breaker.status as { isOpen?: boolean; isClosed?: boolean; isHalfOpen?: boolean } | undefined;
            status[name] = {
                isOpen: breakerStatus?.isOpen ?? false,
                isClosed: breakerStatus?.isClosed ?? false,
                isHalfOpen: breakerStatus?.isHalfOpen ?? false,
            };
        }

        return status;
    }

    /**
     * Reset all breakers
     */
    resetAll(): void {
        for (const [name, breaker] of this.breakers) {
            breaker.close();
            this.logger.log(`Reset circuit breaker for: ${name}`);
        }
    }

    /**
     * Reset a specific breaker
     */
    reset(providerName: string): void {
        const breaker = this.breakers.get(providerName);
        if (breaker) {
            breaker.close();
            this.logger.log(`Reset circuit breaker for: ${providerName}`);
        }
    }

    /**
     * Get total failure count across all breakers
     */
    getTotalFailureCount(): number {
        let total = 0;
        for (const [, breaker] of this.breakers) {
            const stats = breaker.status as { failures?: number } | undefined;
            total += stats?.failures ?? 0;
        }
        return total;
    }
}