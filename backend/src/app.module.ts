
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TreesModule } from './trees/trees.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { AdminModule } from './admin/admin.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CollectionsModule } from './collections/collections.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
        MailModule,
        CloudinaryModule,
        TreesModule,
        AdminModule,
        CollectionsModule,
    ],
})
export class AppModule { }
