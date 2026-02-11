import { Controller, Get, Post, Body, Delete, Param, UseGuards, Patch, Request, ForbiddenException } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('collections')
export class CollectionsController {
    constructor(private readonly collectionsService: CollectionsService) { }

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    getCollections(@Request() req: any) {
        // Simple role check if token exists
        const isAdmin = req.user?.role === UserRole.ADMIN;
        return this.collectionsService.getCollections(isAdmin);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my')
    getMyCollections(@Request() req: any) {
        return this.collectionsService.getMyCollections(req.user.id);
    }

    // Specific segments first
    @UseGuards(JwtAuthGuard)
    @Patch('cards/:id')
    async updateCard(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
        if (req.user.role !== UserRole.ADMIN) {
            const card: any = await this.collectionsService.getCard(id);
            if (!card || card.collection.authorId !== req.user.id) {
                throw new ForbiddenException('You do not own this card');
            }
        }
        return this.collectionsService.updateCard(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('cards/:id')
    async deleteCard(@Param('id') id: string, @Request() req: any) {
        if (req.user.role !== UserRole.ADMIN) {
            const card: any = await this.collectionsService.getCard(id);
            if (!card || card.collection.authorId !== req.user.id) {
                throw new ForbiddenException('You do not own this card');
            }
        }
        return this.collectionsService.deleteCard(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('relations/:id')
    async deleteRelation(@Param('id') id: string, @Request() req: any) {
        if (req.user.role !== UserRole.ADMIN) {
            const relation: any = await this.collectionsService.getRelation(id);
            if (!relation || relation.collection.authorId !== req.user.id) {
                throw new ForbiddenException('You do not own this relation');
            }
        }
        return this.collectionsService.deleteRelation(id);
    }

    // Then parametric IDs
    @Get(':id')
    getCollection(@Param('id') id: string) {
        return this.collectionsService.getCollection(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('contribute')
    contribute(@Request() req: any, @Body() dto: any) {
        return this.collectionsService.createCollection(dto, req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    createCollection(@Body() dto: any) {
        return this.collectionsService.createCollection(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req: any) {
        const collection: any = await this.collectionsService.getCollection(id);

        // Admin can set any status
        if (req.user.role === UserRole.ADMIN) {
            return this.collectionsService.updateCollectionStatus(id, status);
        }

        // Author can set to PENDING (resubmit) if currently DRAFT or REJECTED
        if (collection?.authorId === req.user.id) {
            if (status !== 'PENDING') {
                throw new ForbiddenException('You can only set your collection to PENDING status');
            }
            return this.collectionsService.updateCollectionStatus(id, status);
        }

        throw new ForbiddenException('You do not have permission to update this status');
    }

    @UseGuards(JwtAuthGuard) // Changed guard
    // Removed @Roles(UserRole.ADMIN)
    @Patch(':id')
    async updateCollection(@Param('id') id: string, @Body() dto: any, @Request() req: any) { // Made async, added req
        if (req.user.role !== UserRole.ADMIN) {
            const collection: any = await this.collectionsService.getCollection(id);
            if (collection?.authorId !== req.user.id) {
                throw new ForbiddenException('You do not own this collection');
            }
        }
        return this.collectionsService.updateCollection(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/cards')
    async addCard(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
        if (req.user.role !== UserRole.ADMIN) {
            const collection: any = await this.collectionsService.getCollection(id);
            if (collection?.authorId !== req.user.id) {
                throw new ForbiddenException('You do not own this collection');
            }
        }
        return this.collectionsService.addCard(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    deleteCollection(@Param('id') id: string) {
        return this.collectionsService.deleteCollection(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/relations')
    async addRelation(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
        if (req.user.role !== UserRole.ADMIN) {
            const collection: any = await this.collectionsService.getCollection(id);
            if (collection?.authorId !== req.user.id) {
                throw new ForbiddenException('You do not own this collection');
            }
        }
        return this.collectionsService.addRelation(id, dto);
    }
}
