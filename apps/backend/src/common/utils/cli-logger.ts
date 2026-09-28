import { Logger } from '@nestjs/common';

const formatValue = (value: unknown): string => {
    if (value instanceof Error) {
        return value.message;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
        return String(value);
    }

    if (value === null || value === undefined) {
        return String(value);
    }

    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

const formatArgs = (args: unknown[]): string => args.map(formatValue).join(' ');

export class CliLogger {
    private readonly logger: Logger;

    constructor(context: string) {
        this.logger = new Logger(context);
    }

    log(...args: unknown[]): void {
        this.logger.log(formatArgs(args));
    }

    warn(...args: unknown[]): void {
        this.logger.warn(formatArgs(args));
    }

    error(...args: unknown[]): void {
        const error = args.find((arg): arg is Error => arg instanceof Error);
        this.logger.error(formatArgs(args), error?.stack);
    }
}

export const createCliLogger = (context: string): CliLogger => new CliLogger(context);
