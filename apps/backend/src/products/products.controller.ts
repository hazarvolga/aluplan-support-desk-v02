import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll() {
        return this.productsService.findAllProducts();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    create(@Body() body: { name: string; description?: string }) {
        return this.productsService.createProduct(body);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
        return this.productsService.getProduct(id);
    }

    @Post(':id/categories')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    createCategory(@Param('id') id: string, @Body() body: { name: string; keywords?: string[] }) {
        return this.productsService.createCategory(id, body);
    }

    @Patch('categories/:categoryId')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    updateCategory(@Param('categoryId') categoryId: string, @Body() body: { name?: string; keywords?: string[] }) {
        return this.productsService.updateCategory(categoryId, body);
    }

    @Delete('categories/:categoryId')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('admin', 'support_manager')
    deleteCategory(@Param('categoryId') categoryId: string) {
        return this.productsService.deleteCategory(categoryId);
    }
}
