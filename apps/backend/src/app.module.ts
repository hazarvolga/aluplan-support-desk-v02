import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { default as Redis } from 'ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RbacModule } from './rbac/rbac.module';
import { HealthModule } from './health/health.module';
import { TicketsModule } from './tickets/tickets.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { AiModule } from './ai/ai.module';
import { FaqModule } from './faq/faq.module';
import { EmailModule } from './email/email.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CustomersModule } from './customers/customers.module';
import { SettingsModule } from './settings/settings.module';
import { MacrosModule } from './macros/macros.module';
import { AutomationModule } from './automation/automation.module';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { OmniChannelModule } from './omni-channel/omni-channel.module';
import { BullModule } from '@nestjs/bullmq';
import { KnowledgePoolModule } from './knowledge-pool/knowledge-pool.module';
import configuration, { validate } from './config/configuration';
import { ProductsModule } from './products/products.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { ReportsModule } from './reports/reports.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { APP_INTERCEPTOR, APP_GUARD, DiscoveryModule } from '@nestjs/core';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { RedisModule } from './redis/redis.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import * as crypto from 'crypto';
import { TeamsModule } from './teams/teams.module';
import { BrandingModule } from './branding/branding.module';
import { CrmModule } from './crm/crm.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AnnouncementTemplatesModule } from './announcement-templates/announcement-templates.module';
import { EmailValidatorModule } from './email-validator/email-validator.module';
import { CommonModule } from './common/common.module';
import { LoggerModule } from 'nestjs-pino';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { QueueDashboardModule } from './queue-dashboard/queue-dashboard.module';
import { ProactiveChatModule } from './proactive-chat/proactive-chat.module';
import { OpsDashboardModule } from './ops-dashboard/ops-dashboard.module';
import { ReviewCenterModule } from './review-center/review-center.module';
import { CronShutdownService } from './common/services/cron-shutdown.service';
import { WorkerShutdownService } from './common/services/worker-shutdown.service';

@Module({
    imports: [
        // Discover shared Redis before Bull/features: Nest reverses global-module
        // discovery order during final shutdown, so workers finish before Redis.
        // Keep redis-shutdown-order.spec green when changing imports/Nest versions.
        RedisModule,
        DiscoveryModule,
        SentryModule.forRoot(),
        LoggerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const isProd = config.get('nodeEnv') === 'production';
                const lokiHost = config.get('LOKI_HOST');

                let transport;
                if (!isProd) {
                    transport = { target: 'pino-pretty', options: { colorize: true } };
                } else if (lokiHost) {
                    transport = {
                        target: 'pino-loki',
                        options: {
                            batching: true,
                            interval: 5,
                            host: lokiHost,
                            labels: { app: 'aluplan-backend' }
                        }
                    };
                }

                return {
                    pinoHttp: {
                        level: isProd ? 'info' : 'debug',
                        transport,
                        genReqId: (req) => req.headers['x-request-id'] || req.id || crypto.randomUUID(),
                        // GAP-15: PII redaction — prevent sensitive data from leaking into logs
                        redact: {
                            paths: [
                                'req.headers.authorization',
                                'req.headers.cookie',
                                'req.body.password',
                                'req.body.newPassword',
                                'req.body.email',
                                'req.body.clientSecret',
                                'req.body.webhookSecret',
                            ],
                            censor: '***REDACTED***',
                        },
                    },
                };
            },
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validate,
            envFilePath: ['.env.local', '.env'],
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const connection = new Redis(config.get<string>('redis.url') as string, {
                    maxRetriesPerRequest: null,
                });
                return {
                    connection: connection as unknown as object,
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: { type: 'exponential', delay: 5000 },
                        removeOnComplete: { count: 100 },
                        removeOnFail: { count: 500 }, // DLQ: retain last 500 failed jobs
                    }
                };
            },
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                throttlers: [
                    {
                        name: 'default',
                        ttl: 60000,
                        limit: 120,
                    },
                ],
                storage: new ThrottlerStorageRedisService(config.get<string>('redis.url')),
            }),
        }),
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        PrismaModule,
        AuthModule,
        UsersModule,
        RbacModule,
        HealthModule,
        TicketsModule,
        AttachmentsModule,
        KnowledgeBaseModule,
        AiModule,
        FaqModule,
        EmailModule,
        CustomersModule,
        SettingsModule,
        MacrosModule,
        OmniChannelModule,
        KnowledgePoolModule,
        ProductsModule,
        WhatsAppModule,
        ReportsModule,
        NotificationsModule,
        WebhooksModule,
        AutomationModule,
        TeamsModule,
        BrandingModule,
        CrmModule,
        AnnouncementsModule,
        AnnouncementTemplatesModule,
        EmailValidatorModule,
        CommonModule,
        LoggerModule,
        MetricsModule,
        QueueDashboardModule,
        ProactiveChatModule,
        OpsDashboardModule,
        ReviewCenterModule,
    ],
    providers: [
        CronShutdownService,
        WorkerShutdownService,
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditLogInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: MetricsInterceptor,
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
