import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EmailValidatorService } from './email-validator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

@Controller('email-validator')
@UseGuards(JwtAuthGuard, RbacGuard)
export class EmailValidatorController {
    constructor(private readonly validatorService: EmailValidatorService) { }

    @Get('verify')
    @Roles('ADMIN') // Restrict to admin for testing
    async verifyEmail(@Query('email') email: string) {
        return this.validatorService.validate(email);
    }
}
