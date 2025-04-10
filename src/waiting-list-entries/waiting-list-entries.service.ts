import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitingListEntryDto } from './dto/create-waiting-list-entry.dto';
import { UpdateEntryStatusDto } from './dto/update-entry-status.dto';
import { UpdateEntryPositionDto } from './dto/update-entry-position.dto';

@Injectable()
export class WaitingListEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWaitingListEntryDto: CreateWaitingListEntryDto) {
    return this.prisma.waitingListEntry.create({
      data: createWaitingListEntryDto,
    });
  }

  async findAll() {
    return this.prisma.waitingListEntry.findMany({
      include: {
        waitingList: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.waitingListEntry.findUnique({
      where: { id },
      include: {
        waitingList: true,
      },
    });
  }

  async updateStatus(id: number, updateEntryStatusDto: UpdateEntryStatusDto) {
    return this.prisma.waitingListEntry.update({
      where: { id },
      data: updateEntryStatusDto,
    });
  }

  async updatePosition(id: number, updateEntryPositionDto: UpdateEntryPositionDto) {
    return this.prisma.waitingListEntry.update({
      where: { id },
      data: updateEntryPositionDto,
    });
  }

  async remove(id: number) {
    return this.prisma.waitingListEntry.delete({
      where: { id },
    });
  }
} 