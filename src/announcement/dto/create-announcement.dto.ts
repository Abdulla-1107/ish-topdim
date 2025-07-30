import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AnnouncementType {
  service = 'service',
  job = 'job',
}

export class CreateAnnouncementDto {
  @ApiProperty({
    example: 'Santexnik xizmati',
    description: 'E’lon sarlavhasi',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Suv quvurlari ta’mirlash bo‘yicha xizmatlar',
    description: 'E’lon tavsifi',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '50000',
    description: 'Xizmat narxi (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  price?: Number;

  @ApiProperty({
    example: 'c7691714-b9d7-4ed6-99c6-a241f741f3d6',
    description: 'Shahar IDsi (City model IDsi)',
  })
  @IsString()
  @IsNotEmpty()
  cityId: string;

  @ApiProperty({
    example: 'Olmazor',
    description: 'Mahalla yoki tuman (district)',
  })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({
    example: AnnouncementType.service,
    description: 'E’lon turi',
    enum: AnnouncementType,
  })
  @IsEnum(AnnouncementType)
  type: AnnouncementType;
}
