import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionsService {
    constructor(private prisma: PrismaService) { }

    async getCollections() {
        return this.prisma.collection.findMany({
            include: {
                cards: true,
                relations: true,
            },
        });
    }

    async getCollection(id: string) {
        return this.prisma.collection.findUnique({
            where: { id },
            include: {
                cards: true,
                relations: true,
            },
        });
    }

    // Admin methods
    async createCollection(dto: any) {
        return this.prisma.collection.create({
            data: dto,
        });
    }

    async addCard(collectionId: string, dto: any) {
        return this.prisma.collectionCard.create({
            data: {
                ...dto,
                collectionId,
            },
        });
    }

    async addRelation(collectionId: string, dto: any) {
        return this.prisma.collectionRelation.create({
            data: {
                ...dto,
                collectionId,
            },
        });
    }

    async deleteRelation(id: string) {
        return this.prisma.collectionRelation.delete({ where: { id } });
    }

    async deleteCollection(id: string) {
        return this.prisma.collection.delete({ where: { id } });
    }

    async deleteCard(id: string) {
        return this.prisma.collectionCard.delete({ where: { id } });
    }

    async updateCollection(id: string, dto: any) {
        return this.prisma.collection.update({
            where: { id },
            data: dto,
        });
    }

    async updateCard(id: string, dto: any) {
        return this.prisma.collectionCard.update({
            where: { id },
            data: dto,
        });
    }
}
