import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';
import { EmailModule } from '../email/email.module';
import { PROACTIVE_CHAT_QUEUE } from '../proactive-chat/proactive-chat.module';

@Module({
    imports: [
        PrismaModule,
        ConfigModule,
        RedisModule,
        forwardRef(() => EmailModule),
        BullModule.registerQueue({ name: PROACTIVE_CHAT_QUEUE }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
            }),
        }),
    ],
    controllers: [NotificationsController],
    providers: [NotificationsGateway],
    exports: [NotificationsGateway],
})
export class NotificationsModule { }
