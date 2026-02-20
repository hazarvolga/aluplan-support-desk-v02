import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RbacGuard } from './rbac.guard';

@Module({
    providers: [
        // Apply RBAC guard globally after JWT guard
        {
            provide: APP_GUARD,
            useClass: RbacGuard,
        },
    ],
    exports: [],
})
export class RbacModule { }
