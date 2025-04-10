import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitingListDto } from './dto/create-waiting-list.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WaitingListsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new waiting list for a specific date
   * @param createWaitingListDto - The data for creating a new waiting list
   * @returns The created waiting list
   * @throws ConflictException if a waiting list already exists for the given date
   */
  async createWaitingList(createWaitingListDto: CreateWaitingListDto) {
    try {
      return await this.prisma.waitingList.create({
        data: createWaitingListDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `A waiting list already exists for date ${createWaitingListDto.date.toISOString()}`,
          );
        }
      }
      throw error;
    }
  }

  async getWaitingList(id: number) {
    const waitingList = await this.prisma.waitingList.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!waitingList) {
      throw new NotFoundException(`Waiting list with ID ${id} not found`);
    }

    return waitingList;
  }

  async getWaitingListByDate(date: Date) {
    const waitingList = await this.prisma.waitingList.findUnique({
      where: { date },
      include: {
        entries: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!waitingList) {
      throw new NotFoundException(`Waiting list for date ${date.toISOString()} not found`);
    }

    return waitingList;
  }

  async getAllWaitingLists(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [waitingLists, total] = await Promise.all([
      this.prisma.waitingList.findMany({
        skip,
        take: limit,
        include: {
          entries: {
            orderBy: {
              position: 'asc',
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.waitingList.count(),
    ]);

    return {
      data: waitingLists,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 