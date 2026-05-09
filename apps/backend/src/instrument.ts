import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Before anything else happens, load the specific localized environment variables. 
// We are manually loading the `.env` here to ensure early Sentry init can find SENTRY_DSN
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

/**
 * Initializes the Sentry APM metrics and Error Tracking agent bounds for the application execution cycle.
 * Called as the absolute first invocation point within main.js/main.ts.
 */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
// Tracing
// We recommend adjusting this value in production, or using tracesSampler
// for finer control
tracesSampleRate: 0.1, // GAP-08: Reduced from 1.0 to 0.1 (10%) for production

// Set sampling rate for profiling - this is relative to tracesSampleRate
profilesSampleRate: 0.1, // GAP-08: Reduced from 1.0 to 0.1 (10%) for production

    integrations: [
        nodeProfilingIntegration(),
    ],
});
