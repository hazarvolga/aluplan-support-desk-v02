import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { Public } from '../auth/decorators/public.decorator';
import {
    CreateProductCategoryDto,
    CreateProductDto,
    UpdateProductCategoryDto,
    UpdateProductDto,
} from './dto/product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @Public()
    findAll() {
        return this.productsService.findAllProducts();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    create(@Body() body: CreateProductDto) {
        return this.productsService.createProduct(body);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.getProduct(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateProductDto) {
        return this.productsService.updateProduct(id, body);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.archiveProduct(id);
    }

    @Post(':id/categories')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    createCategory(@Param('id', ParseUUIDPipe) id: string, @Body() body: CreateProductCategoryDto) {
        return this.productsService.createCategory(id, body);
    }

    @Patch('categories/:categoryId')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    updateCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string, @Body() body: UpdateProductCategoryDto) {
        return this.productsService.updateCategory(categoryId, body);
    }

    @Delete('categories/:categoryId')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    deleteCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
        return this.productsService.deleteCategory(categoryId);
    }

    @Post('internal/restore-faqs')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin')
    restoreFaqs() {
        return this.productsService.restoreAllplanFaqs();
    }
}
