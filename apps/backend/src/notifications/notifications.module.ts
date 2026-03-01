import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [
        PrismaModule,
        ConfigModule,
        RedisModule,
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
