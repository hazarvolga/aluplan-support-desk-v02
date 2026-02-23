import { Module } from '@nestjs/common';
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

import { EventEmitterModule } from '@nestjs/event-emitter';
import { OmniChannelModule } from './omni-channel/omni-channel.module';
import { BullModule } from '@nestjs/bullmq';
import { KnowledgePoolModule } from './knowledge-pool/knowledge-pool.module';
import configuration, { validate } from './config/configuration';
import { ProductsModule } from './products/products.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            validate,
            envFilePath: ['.env.local', '.env'],
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                connection: {
                    host: config.get<string>('redis.host'),
                    port: config.get<number>('redis.port'),
                },
            }),
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                throttlers: [
                    {
                        name: 'default',
                        ttl: 60000,
                        limit: 10,
                    },
                ],
                storage: new ThrottlerStorageRedisService({
                    host: config.get<string>('redis.host'),
                    port: config.get<number>('redis.port'),
                }),
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
        NotificationsModule,
    ],
    providers: [],
})
export class AppModule { }
