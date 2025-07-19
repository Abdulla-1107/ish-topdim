import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ApiConsumes, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('upload')
@ApiTags('Upload')
export class UploadController {
  @Post()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './images',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'Fayl yuklanmadi' };
    }

    return { image: file.filename };
  }
}
