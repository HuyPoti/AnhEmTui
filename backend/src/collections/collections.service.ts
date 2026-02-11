import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionsService {
    constructor(private prisma: PrismaService) { }

    async getCollections(isAdmin = false) {
        return this.prisma.collection.findMany({
            where: isAdmin ? {} : { status: 'APPROVED' },
            include: {
                cards: true,
                relations: true,
                author: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
    }

    async getMyCollections(authorId: string) {
        return this.prisma.collection.findMany({
            where: { authorId },
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
                author: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Admin methods
    async createCollection(dto: any, authorId?: string) {
        return this.prisma.collection.create({
            data: {
                ...dto,
                authorId,
                status: authorId ? 'PENDING' : 'APPROVED',
            },
        });
    }

    async updateCollectionStatus(id: string, status: string) {
        return this.prisma.collection.update({
            where: { id },
            data: { status },
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

    async getCard(id: string) {
        return this.prisma.collectionCard.findUnique({
            where: { id },
            include: { collection: true },
        });
    }

    async getRelation(id: string) {
        return this.prisma.collectionRelation.findUnique({
            where: { id },
            include: { collection: true },
        });
    }
}
