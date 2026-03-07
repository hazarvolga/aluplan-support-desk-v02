import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesService } from './roles.service';
import { RbacGuard } from './rbac.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [
        RolesService,
        // Apply RBAC guard globally after JWT guard
        {
            provide: APP_GUARD,
            useClass: RbacGuard,
        },
    ],
    exports: [RolesService],
})
export class RbacModule { }
