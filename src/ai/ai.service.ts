import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { PrismaService } from 'src/prisma/prisma.service';
import * as ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Linux yo‘llari — ffmpeg tizimga o‘rnatilgan
    ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
    ffmpeg.setFfprobePath('/usr/bin/ffprobe');
  }

  getAudioDurationInSeconds(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) return reject(err);
        const duration = metadata.format.duration;
        resolve(duration);
      });
    });
  }

  async transcribeAudio(filePath: string): Promise<string> {
    const duration = await this.getAudioDurationInSeconds(filePath);

    if (duration >= 60) {
      throw new BadRequestException(
        'Audio fayl 60 soniyadan oshmasligi kerak.',
      );
    }
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('model', 'gpt-4o-transcribe');

    const res = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      {
        headers: {
          Authorization: `Bearer ${this.config.get('API_KEY')}`,
          ...form.getHeaders(),
        },
      },
    );

    await fs.promises.unlink(filePath).catch(() => null);
    return res.data.text;
  }

  async detectIntent(userText: string): Promise<any> {
    const prompt = `Foydalanuvchining maqsadini aniqlang. Quyidagi formatda faqat JSON ko‘rinishda javob bering:

{
  "action": "job_search" | "hire_worker",
  "field": ["frontend", "backend"],
  "location": "Toshkent",
  "experience": "2 yil",
  "other": "3ta odam kerak"
}

Faqat JSON qaytaring, boshqa so‘z yozmang.`;

    const result = await this.callChatGPT(prompt, userText);

    try {
      const parsed = JSON.parse(result);
      if (typeof parsed.field === 'string') {
        parsed.field = parsed.field
          .split(',')
          .map((f) => f.trim().toLowerCase());
      }
      if (!Array.isArray(parsed.field) || parsed.field.length === 0) {
        parsed.field = ['ish'];
      }
      return parsed;
    } catch (err) {
      this.logger.error('AI noto‘g‘ri JSON qaytardi:', result);
      return {
        error: true,
        message: 'AI javobi JSON formatda emas.',
        raw: result,
      };
    }
  }

  async matchUsers(ai: any) {
    if (ai?.error) return { message: ai.message };
    if (!Array.isArray(ai.field) || ai.field.length === 0) {
      return { message: "AI natijasida 'field' noto‘g‘ri yoki yo‘q." };
    }

    const filterByText = {
      OR: ai.field.flatMap((f) => [
        { title: { contains: f, mode: 'insensitive' } },
        { description: { contains: f, mode: 'insensitive' } },
      ]),
      ...(ai.location && {
        City: {
          name: {
            equals: ai.location,
            mode: 'insensitive',
          },
        },
      }),
    };

    const type = ai.action === 'hire_worker' ? 'service' : 'job';
    const announcements = await this.prisma.announcement.findMany({
      where: { type, ...filterByText },
      include: {
        user: { select: { fullName: true, phone: true } },
        City: true,
      },
    });

    if (!announcements.length) {
      return {
        found: false,
        data: [],
        message:
          type === 'service'
            ? 'Mos ishchilar e’loni topilmadi.'
            : 'Mos ish e’lonlari topilmadi.',
      };
    }

    return { found: true, data: announcements };
  }

  async handleTextMessage(text: string) {
    if (!text || text.trim().length === 0) {
      return { status: 'error', message: 'Matn bo‘sh bo‘lishi mumkin emas.' };
    }

    const aiResult = await this.detectIntent(text);
    if (aiResult?.error) {
      return {
        status: 'error',
        message: aiResult.message || 'AI ni tushunishda xatolik.',
        raw: aiResult.raw,
      };
    }

    const matched = await this.matchUsers(aiResult);
    return {
      status: 'success',
      input: text,
      aiResult,
      matched,
    };
  }

  async handleFreeTextMessage(text: string, userId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId } });
    const name = user?.fullName?.split(' ')[0];

    const intent = await this.detectIntent(text);
    if (intent?.error || !intent?.action) {
      const reply = await this.callChatGPT(
        'Sen foydalanuvchi bilan hushmuomala, foydali, kulgili va yordam beradigan chatbot bo‘lasan.',
        text,
        0.7,
      );
      return {
        status: 'success',
        type: 'chat',
        input: text,
        reply: name ? `${name}, ${reply}` : reply,
        aiType: 'fallback',
      };
    }

    const results = await this.matchUsers(intent);
    const summary = await this.summarizeResult(intent, results);
    return {
      status: 'success',
      type: 'search',
      input: text,
      intent,
      matched: results,
      reply: name ? `${name}, ${summary}` : summary,
    };
  }

  async summarizeResult(intent: any, result: any) {
    const prompt =
      'Foydalanuvchi soroviga javoban topilgan e’lonlarni chiroyli tarzda jamlab, qisqacha tushunarli javob qaytar. Juda uzun bo‘lmasin.';
    const message = `User sorovi: ${JSON.stringify(intent)}\nNatija: ${JSON.stringify(result)}`;
    return this.callChatGPT(prompt, message, 0.5);
  }

  async extractAnnouncementData(userText: string): Promise<any> {
    const prompt = `Foydalanuvchi ish e’loni bermoqda. Siz matndan quyidagi maydonlarni ajratib, faqat JSON formatda quyidagicha qaytaring:

{
  "title": "...",
  "description": "...",
  "location": "...",
  "district": "...",
  "price": 0,
  "type": "service" // "service" agar ishchi kerak bo‘lsa, "job" agar ish qidirayotgan bo‘lsa
}

❗️Majburiy bo‘lmagan maydonlar null bo‘lishi mumkin. Faqat JSON formatda qaytaring. "type" maydoni foydalanuvchining niyatiga qarab aniqlansin.`;

    const raw = await this.callChatGPT(prompt, userText, 0.4);
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.type) parsed.type = 'service';
      return parsed;
    } catch (err) {
      this.logger.error('E’lon JSON xatosi:', raw);
      return {
        error: true,
        message: 'AI JSON formatda e’lon ma’lumotini qaytara olmadi.',
        raw,
      };
    }
  }

  async saveContext(userId: string, parsed: any) {
    const data = this.pickContextFields(parsed);
    await this.prisma.aIContext.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async getOrMergeContext(userId: string, parsed: any) {
    const context = await this.prisma.aIContext.findUnique({
      where: { userId },
    });
    if (!context) return parsed;
    return {
      ...context,
      ...parsed,
      title: parsed.title || context.title,
      description: parsed.description || context.description,
      price: parsed.price || context.price,
      location: parsed.location || context.location,
      district: parsed.district || context.district,
      type: parsed.type || context.type || 'service',
    };
  }

  async saveAnnouncementFromText(userText: string, userId: string) {
    let extracted = await this.extractAnnouncementData(userText);
    if (extracted?.error) {
      return {
        status: 'error',
        message: extracted.message || 'E’lon ma’lumotlari ajratilmadi',
        raw: extracted.raw,
      };
    }

    extracted = await this.getOrMergeContext(userId, extracted);
    const missing = ['location', 'district'].filter((f) => !extracted[f]);

    if (missing.length > 0) {
      await this.saveContext(userId, extracted);
      const prompts = {
        location: 'qaysi shaharda',
        district: 'qaysi tumanda',
      };
      const message = missing.map((m) => prompts[m]).join(' va ');
      return {
        status: 'need_more_info',
        message: `Iltimos, ${message} ni yozing.`,
        parsed: extracted,
      };
    }

    const city = await this.prisma.city.findFirst({
      where: { name: { equals: extracted.location, mode: 'insensitive' } },
    });

    if (!city) {
      return {
        status: 'incomplete',
        message: `Ko‘rsatilgan shahar (${extracted.location}) topilmadi. Iltimos, aniqroq kiriting.`,
      };
    }

    const created = await this.prisma.announcement.create({
      data: {
        title: extracted.title || 'E’lon',
        description: extracted.description || '',
        price: extracted.price ? Number(extracted.price) : 0,
        type: extracted.type || 'service',
        district: extracted.district || '',
        cityId: city.id,
        userId,
      },
    });

    await this.prisma.aIContext.deleteMany({ where: { userId } });
    return {
      status: 'success',
      message: 'E’lon muvaffaqiyatli saqlandi',
      data: created,
    };
  }

  private async callChatGPT(
    systemContent: string,
    userContent: string,
    temperature = 0.2,
  ) {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userContent },
        ],
        temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${this.config.get('API_KEY')}`,
        },
      },
    );

    return res.data.choices[0].message.content;
  }

  private pickContextFields(parsed: any) {
    return {
      title: parsed.title || null,
      description: parsed.description || null,
      location: parsed.location || null,
      district: parsed.district || null,
      price: parsed.price ? Number(parsed.price) : null,
      type: parsed.type || null,
    };
  }
}
