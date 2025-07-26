import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  // ✅ BU FUNKSIYA: audio file'dan transcript olish
  async transcribeAudio(filePath: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('model', 'whisper-1');

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.config.get('API_KEY')}`,
            ...formData.getHeaders(),
          },
        },
      );

      return response.data.text;
    } catch (error) {
      console.error('Transcribe xatolik:', error?.response?.data || error.message);
      throw new Error('Transkriptsiya xatoligi');
    }
  }
}
