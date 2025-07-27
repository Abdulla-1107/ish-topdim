import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // 🎙 AUDIO -> TEXT
  async transcribeAudio(filePath: string): Promise<string> {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('model', 'whisper-1');

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

    return res.data.text;
  }

  // 🧠 TEXT -> INTENT
  async detectIntent(userText: string): Promise<any> {
    const messages = [
      {
        role: 'system',
        content: `Foydalanuvchining maqsadini aniqlang. Quyidagi formatda faqat JSON ko‘rinishda javob bering:

{
  "action": "job_search" | "hire_worker",
  "field": ["frontend", "backend"],
  "location": "Toshkent",
  "experience": "2 yil",
  "other": "3ta odam kerak"
}

Faqat JSON qaytaring, boshqa so‘z yozmang.`,
      },
      { role: 'user', content: userText },
    ];

    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${this.config.get('API_KEY')}`,
        },
      },
    );

    const result = res.data.choices[0].message.content;

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
      console.error('AI noto‘g‘ri JSON qaytardi:', result);
      return {
        error: true,
        message: 'AI javobi JSON formatda emas.',
        raw: result,
      };
    }
  }

  // 🔍 INTENT -> DB QUERY
  async matchUsers(ai: any) {
    if (ai?.error) return { message: ai.message };
    if (!Array.isArray(ai.field)) {
      return { message: "AI natijasida 'field' noto‘g‘ri yoki yo‘q." };
    }

    const filterByTitle = {
      OR: ai.field.map((f) => ({
        title: {
          contains: f,
          mode: 'insensitive',
        },
      })),
      ...(ai.location && {
        City: {
          name: {
            equals: ai.location,
            mode: 'insensitive',
          },
        },
      }),
    };

    if (ai.action === 'hire_worker') {
      const announcements = await this.prisma.announcement.findMany({
        where: {
          type: 'service',
          ...filterByTitle,
        },
        include: {
          user: { select: { fullName: true, phone: true } },
          City: true,
        },
      });

      if (!announcements.length) {
        return {
          found: false,
          data: [],
          message: 'Mos ishchilar e’loni topilmadi.',
        };
      }

      return { found: true, data: announcements };
    }

    if (ai.action === 'job_search') {
      const announcements = await this.prisma.announcement.findMany({
        where: {
          type: 'job',
          ...filterByTitle,
        },
        include: {
          user: { select: { fullName: true, phone: true } },
          City: true,
        },
      });

      if (!announcements.length) {
        return {
          found: false,
          data: [],
          message: 'Mos ish e’lonlari topilmadi.',
        };
      }

      return { found: true, data: announcements };
    }

    return {
      message:
        'Menga faqat ishchi yoki ish izlash boyicha sorov yuborishingiz kerak',
    };
  }

  private async summarizeResult(intent: any, results: any): Promise<string> {
    const count = results?.data?.length || 0;

    const inputSummary = [
      intent.action === 'hire_worker'
        ? 'Siz ishchi qidiryapsiz'
        : 'Siz ish qidiryapsiz',
      intent.field?.length ? `yo‘nalish: ${intent.field.join(', ')}` : '',
      intent.location ? `joylashuv: ${intent.location}` : '',
    ]
      .filter(Boolean)
      .join(', ');

    if (!results.found) {
      return `${inputSummary}. Afsuski, mos e’lonlar topilmadi.`;
    }

    return `${inputSummary}. ${count} ta mos e’lon topildi. Birinchi: ${results.data[0].title} — ${results.data[0].user.fullName}, tel: ${results.data[0].user.phone}`;
  }

  async handleFreeTextMessage(text: string) {
    try {
      if (!text || text.trim().length === 0) {
        return {
          status: 'error',
          message: 'Matn bo‘sh bo‘lishi mumkin emas.',
        };
      }

      const intent = await this.detectIntent(text);

      if (intent?.error || !intent?.action) {
        const fallbackMessages = [
          {
            role: 'system',
            content:
              'Sen foydalanuvchi bilan hushmuomala, foydali, kulgili va yordam beradigan chatbot bo‘lasan.',
          },
          {
            role: 'user',
            content: text,
          },
        ];

        const fallbackRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages: fallbackMessages,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${this.config.get('API_KEY')}`,
            },
          },
        );

        const fallbackReply = fallbackRes.data.choices[0].message.content;

        return {
          status: 'success',
          type: 'chat',
          input: text,
          reply: fallbackReply,
          aiType: 'fallback',
        };
      }

      // 2. E’lonlarni topamiz
      const results = await this.matchUsers(intent);

      // 3. AI orqali chiroyli javob yasab qaytaramiz
      const summary = await this.summarizeResult(intent, results);

      return {
        status: 'success',
        type: 'search',
        input: text,
        intent,
        matched: results,
        reply: summary,
      };
    } catch (error) {
      console.error('Chat AI xatolikka uchradi:', error);

      return {
        status: 'error',
        message: 'Ichki xatolik yuz berdi.',
        details: error?.message || error,
      };
    }
  }
}
