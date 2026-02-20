import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
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
    @Roles('admin', 'superuser', 'agent')
    create(@Body() createMacroDto: CreateMacroDto, @Request() req: any) {
        return this.macrosService.create(createMacroDto, req.user.id);
    }

    @Get()
    @Roles('admin', 'superuser', 'agent')
    findAll() {
        return this.macrosService.findAll();
    }

    @Get(':id')
    @Roles('admin', 'superuser', 'agent')
    findOne(@Param('id') id: string) {
        return this.macrosService.findOne(id);
    }

    @Patch(':id')
    @Roles('admin', 'superuser', 'agent')
    update(@Param('id') id: string, @Body() updateMacroDto: UpdateMacroDto) {
        return this.macrosService.update(id, updateMacroDto);
    }

    @Delete(':id')
    @Roles('admin', 'superuser', 'agent')
    remove(@Param('id') id: string) {
        return this.macrosService.remove(id);
    }
}
