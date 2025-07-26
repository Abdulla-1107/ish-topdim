import { Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async create(createResumeDto: CreateResumeDto, userId: string) {
    return this.prisma.resume.create({
      data: {
        ...createResumeDto,
        userId,
      },
    });
  }

  findAll() {
    return `This action returns all resume`;
  }

  findOne(id: number) {
    return `This action returns a #${id} resume`;
  }

  update(id: number, updateResumeDto: UpdateResumeDto) {
    return `This action updates a #${id} resume`;
  }

  remove(id: number) {
    return `This action removes a #${id} resume`;
  }
}
