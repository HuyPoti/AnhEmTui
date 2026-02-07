
import { Injectable, ForbiddenException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SyncTreeDto } from './dto/sync-tree.dto';
import { ShareTreeDto } from './dto/share-tree.dto';
import { PublicAccessDto } from './dto/public-access.dto';

@Injectable()
export class TreesService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async sync(userId: string, data: SyncTreeDto) {
        // Check user premium status logic (migrated from service)
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isPremium: true, email: true }
        });

        if (!user?.isPremium && data.nodes && data.nodes.length > 50) {
            throw new ForbiddenException('Upgrade to Premium to manage more than 50 members');
        }

        // DB Transaction logic (migrated from repository)
        return this.prisma.$transaction(async (tx) => {
            const tree = await tx.tree.upsert({
                where: { id: data.treeId || '00000000-0000-0000-0000-000000000000' },
                update: {
                    name: data.name,
                    isPublic: data.isPublic ?? false,
                },
                create: {
                    id: data.treeId, // If provided, else DB might verify or fail if needed. Assuming client sends UUID.
                    name: data.name,
                    ownerId: userId,
                    isPublic: data.isPublic ?? false,
                },
            });

            if (data.nodes) {
                const memberIds = data.nodes.map((n) => n.id);
                await tx.member.deleteMany({
                    where: {
                        treeId: tree.id,
                        id: { notIn: memberIds },
                    },
                });

                for (const node of data.nodes) {
                    const birthDate = node.birthDate && !isNaN(Date.parse(node.birthDate))
                        ? new Date(node.birthDate)
                        : null;

                    await tx.member.upsert({
                        where: { id: node.id },
                        update: {
                            fullName: node.fullName,
                            gender: node.gender,
                            birthDate,
                            isAlive: node.isAlive,
                            photoUrl: node.photoUrl,
                            job: node.job,
                            alias: node.alias,
                            description: node.description,
                            positionX: node.positionX,
                            positionY: node.positionY,
                        },
                        create: {
                            id: node.id,
                            treeId: tree.id,
                            fullName: node.fullName,
                            gender: node.gender,
                            birthDate,
                            isAlive: node.isAlive,
                            photoUrl: node.photoUrl,
                            job: node.job,
                            alias: node.alias,
                            description: node.description,
                            positionX: node.positionX,
                            positionY: node.positionY,
                        },
                    });
                }
            }

            // Handle relations
            await tx.relation.deleteMany({ where: { treeId: tree.id } });
            if (data.edges && data.edges.length > 0) {
                await tx.relation.createMany({
                    data: data.edges.map((e) => ({
                        id: e.id,
                        treeId: tree.id,
                        sourceMemberId: e.source,
                        targetMemberId: e.target,
                        relationType: e.label || 'Quan hệ',
                    })),
                });
            }

            // Audit Log
            await tx.auditLog.create({
                data: {
                    userId,
                    treeId: tree.id,
                    action: 'CẬP NHẬT GIA PHẢ',
                    details: {
                        name: tree.name,
                        nodeCount: data.nodes ? data.nodes.length : 0,
                        edgeCount: data.edges ? data.edges.length : 0,
                        timestamp: new Date().toISOString()
                    },
                },
            });

            return tree;
        });
    }

    async findAll(userId: string) {
        return this.prisma.tree.findMany({
            where: { ownerId: userId },
            include: {
                members: true,
                relations: true,
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.tree.findUnique({
            where: { id },
            include: {
                members: true,
                relations: true,
            },
        });
    }

    async getHistory(treeId: string) {
        return this.prisma.auditLog.findMany({
            where: { treeId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async share(userId: string, treeId: string, dto: ShareTreeDto) {
        const tree = await this.prisma.tree.findUnique({
            where: { id: treeId },
        });
        if (!tree || tree.ownerId !== userId) {
            throw new ForbiddenException('Only the owner can share the tree');
        }

        // Logic from Service + Repository
        const password = Math.random().toString().substring(2, 8);

        // Update tree public status
        await this.prisma.tree.update({
            where: { id: treeId },
            data: { isPublic: true },
        });

        // Create share record
        const share = await this.prisma.treeShare.create({
            data: {
                treeId,
                sharedWithEmail: dto.email,
                permission: dto.permission,
                sharedPassword: password,
            },
        });

        // Send email
        try {
            await this.mailService.sendShareInvitation(dto.email, tree.name, password);
        } catch (error) {
            console.error('Failed to send share invitation email:', error);
        }

        return share;
    }

    async validatePublicAccess(dto: PublicAccessDto) {
        const share = await this.prisma.treeShare.findFirst({
            where: {
                sharedWithEmail: dto.email,
                sharedPassword: dto.password,
            },
            include: {
                tree: {
                    include: {
                        members: true,
                        relations: true,
                    }
                }
            }
        });

        if (!share) {
            throw new UnauthorizedException('Thông tin truy cập không chính xác hoặc không tồn tại, hoặc cây không công khai.');
        }

        if (!share.tree.isPublic) {
            throw new UnauthorizedException('Thông tin truy cập không chính xác hoặc không tồn tại, hoặc cây không công khai.');
        }

        return share.tree;
    }

    async getSharedTrees(email: string) {
        return this.prisma.treeShare.findMany({
            where: { sharedWithEmail: email },
            include: { tree: true },
        });
    }

    async remove(id: string) {
        await this.prisma.tree.delete({
            where: { id },
        });
    }
}
