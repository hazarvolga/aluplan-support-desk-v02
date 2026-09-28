import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReviewCenterController } from './review-center.controller';
import { ReviewCenterService } from './review-center.service';

@Module({
    imports: [PrismaModule],
    controllers: [ReviewCenterController],
    providers: [ReviewCenterService],
})
export class ReviewCenterModule { }
