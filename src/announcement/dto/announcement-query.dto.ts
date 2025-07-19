import {
  IsOptional,
  IsEnum,
  IsString,
  IsIn,
  IsNumberString,
} from 'class-validator';
import { AnnouncementType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnnouncementQueryDto {
  @ApiPropertyOptional({ enum: AnnouncementType })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ default: '10' })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
