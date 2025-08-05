// src/ai/ai.controller.ts

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs/promises';
import { AiService } from './ai.service';
import { ApiConsumes, ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AiTextDto } from './dto/create-ai.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AiCreateTextDto } from './dto/create-text';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  private getMulterOptions() {
    return FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    });
  }

  @UseGuards(AuthGuard)
  @Post('voice')
  @UseInterceptors(AiController.prototype.getMulterOptions())
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
  @ApiResponse({ status: 201, description: 'AI tahlili natijasi' })
  async voice(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Fayl yuborilmadi! Iltimos, audio fayl yuboring.',
      );
    }

    const transcript = await this.aiService.transcribeAudio(file.path);
    const aiResult = await this.aiService.detectIntent(transcript);
    const matchedUsers = await this.aiService.matchUsers(aiResult);

    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.error('Faylni o‘chirishda xato:', err);
    }

    return {
      status: 'success',
      transcript,
      aiResult,
      matchedUsers,
    };
  }

  @UseGuards(AuthGuard)
  @Post('search-announcement')
  @ApiBody({ type: AiTextDto })
  async chat(@Req() req: Request, @Body() dto: AiTextDto) {
    const userId = req['user-id'];
    return this.aiService.handleFreeTextMessage(dto.text, userId);
  }

  @UseGuards(AuthGuard)
  @Post('create-announcement')
  @ApiBody({ type: AiCreateTextDto })
  async createAnnouncement(@Req() req: Request, @Body() dto: AiCreateTextDto) {
    const userId = req['user-id'];
    return this.aiService.saveAnnouncementFromText(dto.text, userId);
  }

  @UseGuards(AuthGuard)
  @Post('voice-announcement')
  @UseInterceptors(AiController.prototype.getMulterOptions())
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'E’lon yaratish uchun audio yuboring (.mp3, .wav, .m4a)',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'E’lon yaratish natijasi' })
  async createFromVoice(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Fayl yuborilmadi! Iltimos, audio fayl yuboring.',
      );
    }

    const userId = req['user-id'];
    const transcript = await this.aiService.transcribeAudio(file.path);
    const result = await this.aiService.saveAnnouncementFromText(
      transcript,
      userId,
    );

    try {
      await fs.unlink(file.path);
    } catch {}

    const { status, ...rest } = result;

    return {
      status,
      transcript,
      ...rest,
    };
  }
}
