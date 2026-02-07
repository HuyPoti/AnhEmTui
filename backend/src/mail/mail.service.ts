import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }


  async sendShareInvitation(email: string, treeName: string, password: string) {
    const mailOptions = {
      from: `"Anh Em Tui Support" <${this.configService.get<string>('MAIL_USER')}>`,
      to: email,
      subject: `Hồ Sơ Gia Phả: ${treeName} - Lời mời truy cập`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #0f172a; color: #f8fafc;">
          <h2 style="color: #22d3ee; text-align: center; text-transform: uppercase; letter-spacing: 2px;">Lời Mời Truy Cập Gia Phả</h2>
          <p>Chào bạn,</p>
          <p>Bạn đã được cấp quyền truy cập vào hồ sơ gia phả: <strong style="color: #22d3ee;">${treeName}</strong>.</p>
          <p>Để xem sơ đồ, vui lòng truy cập trang chủ và sử dụng bộ danh tính sau:</p>
          <div style="background-color: #1e293b; padding: 20px; border: 1px border-cyan-500/30; border-radius: 5px; margin: 20px 0; font-family: monospace;">
            <p style="margin: 5px 0;"><strong>EMAIL:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>PASSWORD:</strong> <span style="font-size: 20px; color: #22d3ee; font-weight: bold;">${password}</span></p>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">
            * Đây là quyền truy cập giới hạn. Vui lòng không chia sẻ mật khẩu này cho người khác.
          </p>
          <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">Hệ thống quản lý gia phả Anh Em Tui</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOtp(email: string, otp: string) {
    const mailOptions = {
      from: `"Anh Em Tui Security" <${this.configService.get<string>('MAIL_USER')}>`,
      to: email,
      subject: 'Mã OTP Xác Thực - Admin Control Center',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #0f172a; color: #f8fafc;">
          <h2 style="color: #22d3ee; text-align: center; text-transform: uppercase; letter-spacing: 2px;">Xác Thực Đăng Nhập Admin</h2>
          <p>Chào bạn,</p>
          <p>Đây là mã OTP để xác thực đăng nhập vào <strong style="color: #22d3ee;">Admin Control Center</strong>.</p>
          <div style="background-color: #1e293b; padding: 20px; border: 1px solid #22d3ee; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 32px; color: #22d3ee; font-weight: bold; letter-spacing: 8px; font-family: monospace;">${otp}</p>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">
            * Mã OTP này có hiệu lực trong <strong>5 phút</strong>. Không chia sẻ mã này với bất kỳ ai.
          </p>
          <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">Hệ thống quản lý gia phả Anh Em Tui</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationOtp(email: string, otp: string) {
    const mailOptions = {
      from: `"Anh Em Tui" <${this.configService.get<string>('MAIL_USER')}>`,
      to: email,
      subject: 'Xác Thực Email - Anh Em Tui',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #0f172a; color: #f8fafc;">
          <h2 style="color: #22d3ee; text-align: center; text-transform: uppercase; letter-spacing: 2px;">Xác Thực Email</h2>
          <p>Chào bạn,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong style="color: #22d3ee;">Anh Em Tui</strong>.</p>
          <p>Vui lòng sử dụng mã OTP sau để xác thực email của bạn:</p>
          <div style="background-color: #1e293b; padding: 20px; border: 1px solid #22d3ee; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 32px; color: #22d3ee; font-weight: bold; letter-spacing: 8px; font-family: monospace;">${otp}</p>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">
            * Mã OTP này có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.
          </p>
          <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">Hệ thống quản lý gia phả Anh Em Tui</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
