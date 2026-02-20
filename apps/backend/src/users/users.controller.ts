import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(RbacGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Roles('admin', 'support_manager')
    @Get()
    @ApiOperation({ summary: 'List all users' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by id' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Roles('admin')
    @Post()
    @ApiOperation({ summary: 'Create user (Admin only)' })
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Update own user profile' })
    updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
        return this.usersService.updateProfile(req.user.id, dto);
    }

    @Roles('admin')
    @Patch(':id')
    @ApiOperation({ summary: 'Update user (Admin only)' })
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @Roles('admin')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete user (Admin only)' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
