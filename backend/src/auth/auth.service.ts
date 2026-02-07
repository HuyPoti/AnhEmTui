import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                fullName: dto.fullName,
                isEmailVerified: false,
            },
        });

        // Generate OTP for email verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await this.prisma.otp.create({
            data: {
                email: dto.email,
                code: otp,
                expiresAt,
            },
        });

        // Send verification email
        try {
            await this.mailService.sendVerificationOtp(dto.email, otp);
        } catch (error) {
            console.error('Failed to send verification email:', error);
        }

        return {
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
            email: user.email,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isEmailVerified) {
            throw new UnauthorizedException('Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn.');
        }

        if (user.isActive === false) {
            throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.jwtService.sign({ sub: user.id, email: user.email });
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
            token,
        };
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to DB
        await this.prisma.otp.create({
            data: {
                email: dto.email,
                code: otp,
                expiresAt,
            },
        });

        // Send Email
        await this.mailService.sendOtp(dto.email, otp);

        return { message: 'OTP sent to your email' };
    }

    async verifyOtp(dto: VerifyOtpDto) {
        const otpRecord = await this.prisma.otp.findFirst({
            where: {
                email: dto.email,
                code: dto.otp,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otpRecord) {
            throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn');
        }

        return { message: 'Mã OTP hợp lệ' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const otpRecord = await this.prisma.otp.findFirst({
            where: {
                email: dto.email,
                code: dto.otp,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otpRecord) {
            throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn');
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.user.update({
            where: { email: dto.email },
            data: { password: hashedPassword },
        });

        // Delete used/expired OTPs for this email
        await this.prisma.otp.deleteMany({
            where: { email: dto.email },
        });

        return { message: 'Đổi mật khẩu thành công' };
    }

    async verifyEmailOtp(dto: VerifyOtpDto) {
        const otpRecord = await this.prisma.otp.findFirst({
            where: {
                email: dto.email,
                code: dto.otp,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otpRecord) {
            throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn');
        }

        // Mark user as verified
        await this.prisma.user.update({
            where: { email: dto.email },
            data: { isEmailVerified: true },
        });

        // Delete used OTP
        await this.prisma.otp.deleteMany({
            where: { email: dto.email },
        });

        return { message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay.' };
    }

    async resendVerificationOtp(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Email đã được xác thực');
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.prisma.otp.create({
            data: { email, code: otp, expiresAt },
        });

        try {
            await this.mailService.sendVerificationOtp(email, otp);
        } catch (error) {
            console.error('Failed to resend verification email:', error);
        }

        return { message: 'Mã OTP mới đã được gửi đến email của bạn' };
    }
}
