
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TreesService } from './trees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SyncTreeDto } from './dto/sync-tree.dto';
import { ShareTreeDto } from './dto/share-tree.dto';
import { PublicAccessDto } from './dto/public-access.dto';

@Controller('trees')
export class TreesController {
    constructor(private readonly treesService: TreesService) { }

    @Post('public-access')
    publicAccess(@Body() dto: PublicAccessDto) {
        return this.treesService.validatePublicAccess(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('sync')
    sync(@Request() req: any, @Body() syncTreeDto: SyncTreeDto) {
        return this.treesService.sync(req.user.id, syncTreeDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Request() req: any) {
        return this.treesService.findAll(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('shared-with-me')
    getShared(@Request() req: any) {
        return this.treesService.getSharedTrees(req.user.email);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/share')
    share(@Param('id') id: string, @Body() dto: ShareTreeDto, @Request() req: any) {
        return this.treesService.share(req.user.id, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/history')
    getHistory(@Param('id') id: string) {
        return this.treesService.getHistory(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.treesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.treesService.remove(id);
    }
}
