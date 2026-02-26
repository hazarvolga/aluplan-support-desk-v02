import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { Dynamics365Adapter } from './adapters/dynamics365.adapter';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CrmController],
    providers: [CrmService, Dynamics365Adapter],
    exports: [CrmService],
})
export class CrmModule { }
