import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BullModule } from '@nestjs/bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';

/**
 * GAP-12: Bull Board Monitoring UI
 * Provides a visual dashboard at /admin/queues for monitoring all BullMQ queues.
 * Access restricted to ADMIN users via Swagger basic auth in production.
 */
@Module({
    imports: [
        BullModule.registerQueue(
            { name: 'ai-query-processing' },
            { name: 'document-parsing' },
            { name: 'crm-sync' },
            { name: 'email' },
        ),
    ],
})
export class QueueDashboardModule implements OnModuleInit {
    private readonly logger = new Logger(QueueDashboardModule.name);

    constructor(
        @InjectQueue('ai-query-processing') private readonly aiQueue: Queue,
        @InjectQueue('document-parsing') private readonly docQueue: Queue,
        @InjectQueue('crm-sync') private readonly crmQueue: Queue,
        @InjectQueue('email') private readonly emailQueue: Queue,
        private readonly adapterHost: HttpAdapterHost,
        private readonly config: ConfigService,
    ) { }

    onModuleInit() {
        // Only mount Bull Board when NOT in worker-only mode
        if (process.env.WORKER_MODE === 'true') {
            this.logger.log('⏭️  Bull Board skipped — running in worker-only mode');
            return;
        }

        const serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath('/admin/queues');

        createBullBoard({
            queues: [
                new BullMQAdapter(this.aiQueue as any),
                new BullMQAdapter(this.docQueue as any),
                new BullMQAdapter(this.crmQueue as any),
                new BullMQAdapter(this.emailQueue as any),
            ],
            serverAdapter,
        });

        const httpAdapter = this.adapterHost.httpAdapter;
        const app = httpAdapter.getInstance();

        // Production: protect with basic auth (same as Swagger)
        if (this.config.get('NODE_ENV') === 'production') {
            const swaggerPassword = this.config.get('SWAGGER_PASSWORD');
            app.use('/admin/queues', (req: any, res: any, next: any) => {
                const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
                const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
                if (login === 'admin' && password === swaggerPassword) return next();
                res.set('WWW-Authenticate', 'Basic realm="Aluplan Queue Dashboard"');
                res.status(401).send('Authentication required');
            });
        }

        app.use('/admin/queues', serverAdapter.getRouter());
        this.logger.log('📊 Bull Board mounted at /admin/queues');
    }
}
