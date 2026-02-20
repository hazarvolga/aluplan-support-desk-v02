import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { NotificationsGateway } from './notifications/notifications.gateway';
import { CustomersModule } from './customers/customers.module';
import { SettingsModule } from './settings/settings.module';
import { MacrosModule } from './macros/macros.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
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
    ],
    providers: [NotificationsGateway],
})
export class AppModule { }
