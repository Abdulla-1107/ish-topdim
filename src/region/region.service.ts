import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class cityService {
  constructor(private prisma: PrismaService) {}

  async create(createCityDto: CreateRegionDto) {
    const { name } = createCityDto;

    const existingCity = await this.prisma.city.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingCity) {
      throw new BadRequestException('Shahar allaqachon yaratilgan');
    }

    return this.prisma.city.create({
      data: createCityDto,
    });
  }

  async findAll() {
    return this.prisma.city.findMany();
  }

  async findOne(id: string) {
    const city = await this.prisma.city.findFirst({ where: { id } });
    if (!city) {
      throw new NotFoundException(`shahar topilmadi`);
    }
    return city;
  }

  async update(id: string, updatecityDto: UpdateRegionDto) {
    const exists = await this.prisma.city.findFirst({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`shahar topilmadi`);
    }
    return this.prisma.city.update({
      where: { id },
      data: updatecityDto,
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.city.findFirst({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`shahar topilmadi`);
    }
    return this.prisma.city.delete({ where: { id } });
  }
}
