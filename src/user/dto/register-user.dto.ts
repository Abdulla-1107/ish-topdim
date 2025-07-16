import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Ali Valiyev',
    description: 'Foydalanuvchining to‘liq ismi (majburiy)',
  })
  @IsNotEmpty({ message: 'Ism bo‘sh bo‘lmasligi kerak' })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: 'Valiyev',
    description: 'Familiya (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Telefon raqami (majburiy)',
  })
  @IsNotEmpty({ message: 'Telefon raqam kiritilishi kerak' })
  @IsPhoneNumber('UZ', { message: 'Telefon raqam noto‘g‘ri' })
  phone: string;

  @ApiProperty({
    example: 'https://cdn.domain.com/images/user1.jpg',
    description: 'Profil rasmi (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 'user' })
  role: string;
}
