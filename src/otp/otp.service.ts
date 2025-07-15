// src/otp/otp.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface OtpData {
  code: string;
  expiresAt: Date;
  isVerified?: boolean;
}

@Injectable()
export class OtpService {
  private otpStore: Map<string, OtpData> = new Map();

  constructor(private configService: ConfigService) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(phone: string) {
    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    this.otpStore.set(phone, { code, expiresAt });

    setTimeout(
      () => {
        this.otpStore.delete(phone);
      },
      5 * 60 * 1000,
    );

    const token = this.configService.get<string>('ESKIZ_TOKEN');
    console.log(token, 'token');
    

    if (!token) {
      throw new BadRequestException(
        'Eskiz.uz tokeni topilmadi. .env faylida ESKIZ_TOKEN ni sozlang.',
      );
    }

    try {
      const smsResponse = await axios.post(
        'https://notify.eskiz.uz/api/message/sms/send',
        {
          mobile_phone: phone.replace('+', ''),
          message: `Bu Eskiz dan test`,
          from: '4546',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return { message: 'OTP yuborildi', code };
    } catch (error) {
      throw new BadRequestException(
        'SMS yuborishda xatolik yuz berdi: ' +
          (error.response?.data?.message || error.message),
      );
    }
  }

  async verifyOtp(phone: string, code: string) {
    const otpData = this.otpStore.get(phone);

    if (!otpData) {
      throw new BadRequestException('Telefon raqam xato');
    }

    if (otpData.code !== code) {
      throw new BadRequestException('Noto‘g‘ri OTP kodi');
    }

    if (new Date() > new Date(otpData.expiresAt)) {
      this.otpStore.delete(phone);
      throw new BadRequestException('OTP muddati tugagan');
    }

    this.otpStore.set(phone, { ...otpData, isVerified: true });

    return { message: 'OTP tasdiqlandi' };
  }

  async isPhoneVerified(phone: string): Promise<boolean> {
    const otpData = this.otpStore.get(phone);
    return !!(
      otpData &&
      otpData.isVerified &&
      new Date() <= new Date(otpData.expiresAt)
    );
  }
}
