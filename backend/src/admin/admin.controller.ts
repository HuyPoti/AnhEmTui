import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Post('login')
    login(@Body() dto: any) {
        return this.adminService.adminLogin(dto);
    }

    @Post('verify-otp')
    verifyOtp(@Body() dto: any) {
        return this.adminService.verifyAdminOtp(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('stats')
    getStats() {
        return this.adminService.getStats();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('users')
    getUsers() {
        return this.adminService.getUsers();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('trees')
    getTrees() {
        return this.adminService.getTrees();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch('trees/:id/status')
    toggleTreeStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.adminService.toggleTreeStatus(id, isActive);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch('users/:id/status')
    toggleUserStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.adminService.toggleUserStatus(id, isActive);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('change-password')
    changePassword(@Body() dto: any, @Body('userId') userId: string) {
        // userId should ideally come from the @User() decorator, but for now we'll take it from body if needed or just use req.user
        return this.adminService.changePassword(userId, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('activity')
    getActivity() {
        return this.adminService.getActivity();
    }
}
