import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AnnouncementType,
  CreateAnnouncementDto,
} from './dto/create-announcement.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnnouncementQueryDto } from './dto/announcement-query.dto';

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
    return { data: 'salom' };
  }

  async findAll(query: AnnouncementQueryDto) {
    try {
      const {
        type,
        cityId,
        district,
        search,
        userId,
        sortBy = 'createdAt',
        order = 'desc',
        page = '1',
        limit = '10',
      } = query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where: any = {
        ...(type && { type }),
        ...(cityId && { cityId }),
        ...(district && {
          district: { contains: district, mode: 'insensitive' },
        }),
        ...(userId && { userId }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const data = await this.prisma.announcement.findMany({
        where,
        orderBy: {
          [sortBy]: order,
        },
        skip,
        take: parseInt(limit),
        include: {
          City: true,
          user: { select: { phone: true, fullName: true } },
        },
      });

      return {
        data,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          count: data.length,
        },
      };
    } catch (error) {
      console.error('FindAll Announcement Error:', error);
      throw new Error('E’lonlarni yuklashda xatolik yuz berdi');
    }
  }

  async findOne(id: string) {
    let data = await this.prisma.announcement.findFirst({
      where: { id },
      include: {
        user: { select: { fullName: true, phone: true, createdAt: true } },
      },
    });
    if (!data) {
      throw new NotFoundException('elon topilmadi');
    }
    return data;
  }

  async update(id: string, data: any) {
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
