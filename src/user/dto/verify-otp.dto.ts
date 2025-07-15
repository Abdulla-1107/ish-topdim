import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({example: '+998931781164', description: 'Telefon raqami (+998901234567 formatida)' })
  @IsString()
  @Matches(/^\+998\d{9}$/, {
    message: 'Telefon raqami +998 bilan boshlanishi va 9 ta raqamdan iborat bo‘lishi kerak',
  })
  @Length(13, 13, { message: 'Telefon raqami 13 raqamdan iborat bo‘lishi kerak (+998 va 9 raqam)' })
  phone: string;

  @ApiProperty({ description: 'OTP kodi (6 raqamli)' })
  @IsString()
  @Length(6, 6, { message: 'OTP kodi 6 raqamdan iborat bo‘lishi kerak' })
  code: string;
}