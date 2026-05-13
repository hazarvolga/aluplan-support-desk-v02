import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AiHealthEventService } from './ai-health-event.service';

@Module({
    imports: [PrismaModule],
    providers: [AiHealthEventService],
    exports: [AiHealthEventService],
})
export class AiHealthEventModule { }