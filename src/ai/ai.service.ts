// src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  constructor(private config: ConfigService) {}

  async processResumeDialog(userText: string, context: any[] = []) {
    const messages = [
      {
        role: 'system',
        content: `Siz 'Ishtopdim' platformasining AI yordamchisisiz. Foydalanuvchi ish qidirmoqda. Siz unga quyidagi savollarni navbatma-navbat bering, va oxirida JSON ko’rinishida quyidagicha formatlab bering:
{
  "name": "...",
  "age": 25,
  "location": "...",
  "skills": "...",
  "field": "...",
  "phone": "..."
}`,
      },
      ...context,
      {
        role: 'user',
        content: userText,
      },
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${this.config.get('OPENAI_API_KEY')}`,
        },
      },
    );

    return response.data.choices[0].message.content;
  }
}
