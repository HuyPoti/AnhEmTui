import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        PrismaModule,
        MailModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'super-secret',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
