import { Controller, Get, Post, Body, Delete, Param, UseGuards, Patch } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('collections')
export class CollectionsController {
    constructor(private readonly collectionsService: CollectionsService) { }

    @Get()
    getCollections() {
        return this.collectionsService.getCollections();
    }

    // Specific segments first
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch('cards/:id')
    updateCard(@Param('id') id: string, @Body() dto: any) {
        return this.collectionsService.updateCard(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete('cards/:id')
    deleteCard(@Param('id') id: string) {
        return this.collectionsService.deleteCard(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete('relations/:id')
    deleteRelation(@Param('id') id: string) {
        return this.collectionsService.deleteRelation(id);
    }

    // Then parametric IDs
    @Get(':id')
    getCollection(@Param('id') id: string) {
        return this.collectionsService.getCollection(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    createCollection(@Body() dto: any) {
        return this.collectionsService.createCollection(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    updateCollection(@Param('id') id: string, @Body() dto: any) {
        return this.collectionsService.updateCollection(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post(':id/cards')
    addCard(@Param('id') id: string, @Body() dto: any) {
        return this.collectionsService.addCard(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    deleteCollection(@Param('id') id: string) {
        return this.collectionsService.deleteCollection(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post(':id/relations')
    addRelation(@Param('id') id: string, @Body() dto: any) {
        return this.collectionsService.addRelation(id, dto);
    }
}
