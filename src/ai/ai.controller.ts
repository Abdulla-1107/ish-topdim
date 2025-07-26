// src/ai/ai.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AudioService } from '../audio/audio.service';
import { AiService } from './ai.service';
import { ResumeService } from '../resume/resume.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('ai')
export class AiController {
  constructor(
    private audioService: AudioService,
    private aiService: AiService,
    private resumeService: ResumeService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('resume-from-voice')
  @UseInterceptors(FileInterceptor('file'))
  async handleVoiceResume(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const userId = req['user-id'];

    const text = await this.audioService.transcribeAudio(file.path);

    const gptReply = await this.aiService.processResumeDialog(text);

    let parsed;
    try {
      parsed = JSON.parse(gptReply);
    } catch (e) {
      throw new Error('GPT noto‘g‘ri format qaytardi');
    }

    const saved = await this.resumeService.create(parsed, userId);

    return {
      text,
      parsed,
      saved,
    };
  }
}
