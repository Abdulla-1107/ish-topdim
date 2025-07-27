// src/ai/ai.controller.ts

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { AiService } from './ai.service';
import { ApiConsumes, ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AiTextDto } from './dto/create-ai.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('voice')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Audio fayl yuboring (.mp3, .wav, .m4a)',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'AI tahlili natijasi',
  })
  async voice(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Fayl yuborilmadi! Iltimos, audio fayl yuboring.',
      );
    }

    const transcript = await this.aiService.transcribeAudio(file.path);
    const aiResult = await this.aiService.detectIntent(transcript);
    const matchedUsers = await this.aiService.matchUsers(aiResult);

    await fs.promises.unlink(file.path).catch(console.error);

    return {
      status: 'success',
      transcript,
      aiResult,
      matchedUsers,
    };
  }

  @Post('chat')
  @ApiBody({ type: AiTextDto })
  async chat(@Body() dto: AiTextDto) {
    return this.aiService.handleFreeTextMessage(dto.text);
  }
}
