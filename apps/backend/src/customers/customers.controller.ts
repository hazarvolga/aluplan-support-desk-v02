import { Controller, Post, Body, Get, UseGuards, Param, Patch, Req, UseInterceptors, UploadedFile, BadRequestException, Response, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomersService } from './customers.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { ImportCustomerRecordDto } from './dto/import-customers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { Public } from '../auth/decorators/public.decorator';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
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
    async getAllCustomers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.customersService.getAllCustomers(
            page ? parseInt(page, 10) : 1,
            limit ? Math.min(parseInt(limit, 10), 200) : 100,
            search,
        );
    }

    @Post('import')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('ADMIN', 'SUPPORT_MANAGER')
    async importCustomers(@Body() data: ImportCustomerRecordDto[]) {
        return this.customersService.importCustomers(data);
    }

    @Post('me/hotinfo')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
            fileFilter: (req, file, callback) => {
                const lowName = file.originalname.toLowerCase();
                if (!lowName.endsWith('.hxl')) {
                    return callback(new BadRequestException('Sadece .hxl uzantılı Hotinfo dosyaları yüklenebilir.'), false);
                }
                callback(null, true);
            },
        }),
    )
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
        @Body() dto: UpdateCustomerProfileDto
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
