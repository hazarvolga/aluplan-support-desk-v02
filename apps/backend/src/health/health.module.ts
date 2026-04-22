import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
    imports: [
        TerminusModule,
        HttpModule,
        PrismaModule,
        RedisModule,
        BullModule.registerQueue({ name: 'ai-query-processing' }) // We use 'ai-query-processing' to check queue availability
    ],
    controllers: [HealthController],
})
export class HealthModule { }
