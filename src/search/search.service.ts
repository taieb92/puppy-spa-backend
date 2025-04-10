import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchByOwnerName(ownerName: string) {
    return this.prisma.waitingListEntry.findMany({
      where: {
        ownerName: {
          contains: ownerName.toLowerCase(),
        },
      },
      include: {
        waitingList: true,
      },
    });
  }

  async searchByPuppyName(puppyName: string) {
    return this.prisma.waitingListEntry.findMany({
      where: {
        puppyName: {
          contains: puppyName.toLowerCase(),
        },
      },
      include: {
        waitingList: true,
      },
    });
  }

  async searchByService(service: string) {
    return this.prisma.waitingListEntry.findMany({
      where: {
        serviceRequired: {
          contains: service.toLowerCase(),
        },
      },
      include: {
        waitingList: true,
      },
    });
  }
} 