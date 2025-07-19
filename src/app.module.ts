import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { OtpModule } from './otp/otp.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AnnouncementModule } from './announcement/announcement.module';
import { RegionModule } from './region/region.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadController } from './upload/upload.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/file',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 5,
        },
      ],
    }),

    UserModule,
    OtpModule,
    PrismaModule,
    AnnouncementModule,
    RegionModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
