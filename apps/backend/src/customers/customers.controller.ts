import { Controller, Post, Body, Get, UseGuards, Param, Patch, Req, UseInterceptors, UploadedFile, BadRequestException, Response } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomersService } from './customers.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { ImportCustomerRecordDto } from './dto/import-customers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { Public } from '../auth/decorators/public.decorator';
import { Response as Res } from 'express';

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
    @Roles('ADMIN', 'SUPPORT_AGENT', 'SUPPORT_MANAGER')
    async getAllCustomers() {
        return this.customersService.getAllCustomers();
    }

    @Post('import')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('ADMIN', 'SUPPORT_MANAGER')
    async importCustomers(@Body() data: ImportCustomerRecordDto[]) {
        return this.customersService.importCustomers(data);
    }

    @Post('me/hotinfo')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadHotinfo(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Lütfen bir dosya yükleyin.');
        }
        return this.customersService.uploadHotinfo(req.user.id, file.buffer);
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

    @Get(':id/hotinfo/download')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_agent', 'support_manager')
    async downloadHotinfo(@Param('id') userId: string, @Response() res: Res) {
        const { content, filename } = await this.customersService.getHotinfoRaw(userId);
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(content);
    }
}
