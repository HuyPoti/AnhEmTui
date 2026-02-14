import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private jwtService: JwtService,
    ) { }

    async getStats() {
        const [userCount, treeCount, activeTrees] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.tree.count(),
            this.prisma.tree.count({ where: { isActive: true } }),
        ]);
        return { userCount, treeCount, activeTrees };
    }

    async getUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isPremium: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getTrees() {
        return this.prisma.tree.findMany({
            include: {
                owner: {
                    select: { email: true, fullName: true }
                },
                _count: { select: { members: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async toggleTreeStatus(id: string, isActive: boolean) {
        return this.prisma.tree.update({
            where: { id },
            data: { isActive },
        });
    }

    async toggleUserStatus(id: string, isActive: boolean) {
        return this.prisma.user.update({
            where: { id },
            data: { isActive },
        });
    }

    async adminLogin(dto: any) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || user.role !== UserRole.ADMIN) {
            throw new UnauthorizedException('Không có quyền truy cập');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Thông tin không chính xác');
        }

        // Logic 2FA: Gửi OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await this.prisma.otp.create({
            data: {
                email: user.email,
                code: otp,
                expiresAt,
            },
        });

        await this.mailService.sendOtp(user.email, otp);

        return { message: 'OTP_SENT', email: user.email };
    }

    async verifyAdminOtp(dto: any) {
        const otpRecord = await this.prisma.otp.findFirst({
            where: {
                email: dto.email,
                code: dto.otp,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otpRecord) {
            throw new UnauthorizedException('Mã OTP không chính xác hoặc đã hết hạn');
        }

        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) {
            throw new UnauthorizedException('Tài khoản không tồn tại');
        }

        const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });

        // Clean up OTPs
        await this.prisma.otp.deleteMany({ where: { email: dto.email } });

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
            token,
        };
    }
    async changePassword(userId: string, dto: any) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isMatch) throw new UnauthorizedException('Mật khẩu cũ không chính xác');

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        return this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }

    async getActivity() {
        // Fetch recent trees as activity logs for now
        return this.prisma.tree.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                createdAt: true,
            }
        });
    }
}
