import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
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
    @Roles('admin', 'agent')
    async getAllCustomers() {
        return this.customersService.getAllCustomers();
    }
}
