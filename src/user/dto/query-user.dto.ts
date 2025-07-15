import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString, IsDateString } from 'class-validator';

export class UserQueryDto {
  @ApiPropertyOptional({ example: '1', description: 'Page raqami' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({
    example: '10',
    description: 'Har bir sahifadagi elementlar soni',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Foydalanuvchi ismi bo‘yicha qidiruv',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'admin',
    description: 'Role bo‘yicha filter',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Qaysi sanadan boshlab yaratilgan',
  })
  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Qaysi sanagacha yaratilgan',
  })
  @IsOptional()
  @IsDateString()
  createdAtTo?: string;
}
