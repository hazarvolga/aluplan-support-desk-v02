import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { MacrosService } from './macros.service';
import { CreateMacroDto } from './dto/create-macro.dto';
import { UpdateMacroDto } from './dto/update-macro.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';

@Controller('macros')
@UseGuards(JwtAuthGuard, RbacGuard)
export class MacrosController {
    constructor(private readonly macrosService: MacrosService) { }

    @Post()
    @Roles('ADMIN', 'SUPERUSER', 'AGENT')
    create(@Body() createMacroDto: CreateMacroDto, @Request() req: any) {
        return this.macrosService.create(createMacroDto, req.user.id);
    }

    @Get()
    @Roles('ADMIN', 'SUPERUSER', 'AGENT')
    findAll() {
        return this.macrosService.findAll();
    }

    @Get(':id')
    @Roles('ADMIN', 'SUPERUSER', 'AGENT')
    findOne(@Param('id') id: string) {
        return this.macrosService.findOne(id);
    }

    @Get(':id/render')
    @Roles('ADMIN', 'SUPERUSER', 'AGENT')
    renderMacro(@Param('id') id: string, @Query('ticketId') ticketId?: string) {
        return this.macrosService.renderMacro(id, ticketId);
    }

    @Patch(':id')
    @Roles('ADMIN', 'SUPERUSER', 'AGENT')
    update(@Param('id') id: string, @Body() updateMacroDto: UpdateMacroDto) {
        return this.macrosService.update(id, updateMacroDto);
    }

    @Delete(':id')
    @Roles('ADMIN', 'SUPERUSER', 'AGENT')
    remove(@Param('id') id: string) {
        return this.macrosService.remove(id);
    }
}
