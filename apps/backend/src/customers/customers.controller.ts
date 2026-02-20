import { Controller, Post, Body, Get, UseGuards, Param, Patch } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { ImportCustomerRecordDto } from './dto/import-customers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { Public } from '../auth/decorators/public.decorator';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Public()
    @Post('register')
    async register(@Body() registerDto: RegisterCustomerDto) {
        return this.customersService.registerCustomer(registerDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_agent', 'support_manager')
    async getAllCustomers() {
        return this.customersService.getAllCustomers();
    }

    @Post('import')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    async importCustomers(@Body() data: ImportCustomerRecordDto[]) {
        return this.customersService.importCustomers(data);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_agent', 'support_manager')
    async getCustomerById(@Param('id') id: string) {
        return this.customersService.getCustomerById(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    async updateCustomer(
        @Param('id') id: string,
        @Body() dto: import('./dto/update-customer-profile.dto').UpdateCustomerProfileDto
    ) {
        return this.customersService.updateCustomer(id, dto);
    }

    @Post('bulk-delete')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    async bulkDelete(@Body('ids') ids: string[]) {
        return this.customersService.bulkDelete(ids);
    }

    @Post(':id/reset-password')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    async resetPassword(@Param('id') id: string) {
        return this.customersService.resetPassword(id);
    }
}
