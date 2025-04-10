import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitingListDto } from './dto/create-waiting-list.dto';

@Injectable()
export class WaitingListsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWaitingListDto: CreateWaitingListDto) {
    return this.prisma.waitingList.create({
      data: createWaitingListDto,
    });
  }

  async findAll() {
    return this.prisma.waitingList.findMany({
      include: {
        entries: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.waitingList.findUnique({
      where: { id },
      include: {
        entries: true,
      },
    });
  }

  async findByDate(date: Date) {
    return this.prisma.waitingList.findUnique({
      where: { date },
      include: {
        entries: true,
      },
    });
  }
} 