import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { AnnouncementQueryDto } from './dto/announcement-query.dto';
import { Role } from 'src/decorators/role.decorators';
import { UserRole } from 'src/enums/user-role.enum';
import { AdminGuard } from 'src/auth/role.guard';

@Controller('announcement')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Req() req: Request,
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ) {
    const userId = req['user-id'];
    console.log(userId, 'user');

    return this.announcementService.create(createAnnouncementDto, userId);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  findAll(@Query() query: AnnouncementQueryDto) {
    return this.announcementService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnnouncementDto: any) {
    return this.announcementService.update(id, updateAnnouncementDto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.announcementService.remove(id);
  }
}
