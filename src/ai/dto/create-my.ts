import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetMyAnnouncementsDto {
  @ApiProperty({
    example:
      'Menga tegishli elonlarni chiqar',
    description: 'Chat uchun matn',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
