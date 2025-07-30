// dto/ai-text.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AiCreateTextDto {
  @ApiProperty({
    example:
      'Men santexnikman, Toshkent Olmazorda xizmat ko‘rsataman. Suv quvurlarini ta’mirlayman. Narxi 50000 so‘m.',
    description: 'Chat uchun matn',
  })
  @IsString()
  @MinLength(1)
  text: string;
}
