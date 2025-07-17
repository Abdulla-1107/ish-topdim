import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegionDto {
  @ApiProperty({ example: 'Toshkent', description: 'Region nomi' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
