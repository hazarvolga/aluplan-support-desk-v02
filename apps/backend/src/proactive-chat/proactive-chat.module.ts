import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProactiveChatController } from './proactive-chat.controller';
import { ProactiveChatService } from './proactive-chat.service';
import { ProactiveChatTimeoutProcessor } from './proactive-chat-timeout.processor';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

export const PROACTIVE_CHAT_QUEUE = 'proactive-chat';

@Module({
    imports: [
        PrismaModule,
        RedisModule,
        forwardRef(() => NotificationsModule),
        BullModule.registerQueue({ name: PROACTIVE_CHAT_QUEUE }),
    ],
    controllers: [ProactiveChatController],
    providers: [ProactiveChatService, ProactiveChatTimeoutProcessor],
    exports: [ProactiveChatService],
})
export class ProactiveChatModule {}
