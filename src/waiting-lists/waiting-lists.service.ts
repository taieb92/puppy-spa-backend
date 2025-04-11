import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitingListDto } from './dto/create-waiting-list.dto';
import { WaitingListResponseDto, MonthlyWaitingListsResponseDto } from './dto/waiting-list-response.dto';
import { Prisma, WaitingList } from '@prisma/client';

@Injectable()
export class WaitingListsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new waiting list
   * @param createWaitingListDto - The data for creating a new waiting list
   * @returns The created waiting list
   * @throws ConflictException if a waiting list already exists for the given date
   * @throws BadRequestException if the date is invalid
   * @throws InternalServerErrorException if the creation fails
   */
  async createWaitingList(createWaitingListDto: CreateWaitingListDto): Promise<WaitingListResponseDto> {
    try {
      const date = new Date(createWaitingListDto.date);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      const waitingList = await this.prisma.waitingList.create({
        data: {
          date,
        },
        include: {
          entries: true,
        },
      });

      return this.mapToWaitingListResponseDto(waitingList);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A waiting list already exists for this date');
        }
      }
      console.error('Error creating waiting list:', error);
      throw new InternalServerErrorException('Failed to create waiting list');
    }
  }

  /**
   * Gets all waiting lists for a specific month
   * @param month - The month in YYYY-MM format
   * @returns List of waiting lists for the month
   * @throws BadRequestException if the month format is invalid
   * @throws InternalServerErrorException if the query fails
   */
  async getWaitingListsByMonth(month: string): Promise<MonthlyWaitingListsResponseDto> {
    try {
      const [year, monthNum] = month.split('-').map(Number);
      if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        throw new BadRequestException('Invalid month format. Use YYYY-MM');
      }

      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);

      const waitingLists = await this.prisma.waitingList.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          entries: true,
        },
        orderBy: {
          date: 'asc',
        },
      });

      return {
        waitingLists: waitingLists.map(this.mapToWaitingListResponseDto),
        month,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error fetching waiting lists by month:', error);
      throw new InternalServerErrorException('Failed to fetch waiting lists');
    }
  }

  /**
   * Gets a waiting list by date
   * @param date - The date string in YYYY-MM-DD format
   * @returns The waiting list for the given date
   * @throws NotFoundException if no waiting list exists for the given date
   * @throws BadRequestException if the date format is invalid
   * @throws InternalServerErrorException if the query fails
   */
  async getWaitingListByDate(date: string): Promise<WaitingListResponseDto> {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      const waitingList = await this.prisma.waitingList.findUnique({
        where: { date: parsedDate },
        include: {
          entries: true,
        },
      });

      if (!waitingList) {
        throw new NotFoundException(`Waiting list for date ${date} not found`);
      }

      return this.mapToWaitingListResponseDto(waitingList);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error fetching waiting list by date:', error);
      throw new InternalServerErrorException('Failed to fetch waiting list');
    }
  }

  /**
   * Maps a Prisma WaitingList to WaitingListResponseDto
   * @param waitingList - The Prisma WaitingList object
   * @returns The mapped WaitingListResponseDto
   */
  private mapToWaitingListResponseDto(waitingList: WaitingList & { entries: any[] }): WaitingListResponseDto {
    return {
      id: waitingList.id,
      date: waitingList.date,
      entries: waitingList.entries.map(entry => ({
        id: entry.id,
        ownerName: entry.ownerName,
        puppyName: entry.puppyName,
        serviceRequired: entry.serviceRequired,
        arrivalTime: entry.arrivalTime,
        position: entry.position,
        status: entry.status,
      })),
    };
  }
} 