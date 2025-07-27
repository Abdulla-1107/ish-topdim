// dto/ai-text.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AiTextDto {
  @ApiProperty({ example: 'Salom, gpt!', description: 'Chat uchun matn' })
  @IsString()
  @MinLength(1)
  text: string;
}
