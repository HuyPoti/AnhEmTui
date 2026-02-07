import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsString()
    fullName: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    email: string;
}

export class VerifyOtpDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    otp: string;
}

export class ResetPasswordDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    otp: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword: string;
}
