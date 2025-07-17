import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AnnouncementType,
  CreateAnnouncementDto,
} from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnnouncementService {
  constructor(private prisma: PrismaService) {}
  async create(data2: CreateAnnouncementDto, userId: string) {
    const exiting = await this.prisma.city.findFirst({
      where: { id: data2.cityId },
    });
    if (!exiting) {
      throw new NotFoundException('city topilmadi');
    }
    let creadet = await this.prisma.announcement.create({
      data: {
        ...data2,
        userId,
      },
    });
    return creadet;
  }

  async findAll() {
    let data = await this.prisma.announcement.findMany();
    return data;
  }

  async findOne(id: string) {
    let data = await this.prisma.announcement.findFirst({ where: { id } });
    if (!data) {
      throw new NotFoundException('elon topilmadi');
    }
    return data;
  }

  async update(id: string, data: UpdateAnnouncementDto) {
    const existing = await this.prisma.announcement.findFirst({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('elon topilmadi');
    }

    let data2 = await this.prisma.announcement.update({ where: { id }, data });
    return data2;
  }
  async remove(id: string) {
    const existing = await this.prisma.announcement.findFirst({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('elon topilmadi');
    }

    let deleted = await this.prisma.announcement.delete({ where: { id } });
    return deleted;
  }
}
