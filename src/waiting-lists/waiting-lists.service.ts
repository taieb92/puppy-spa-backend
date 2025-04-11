import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitingListDto } from './dto/create-waiting-list.dto';
import {
  WaitingListResponseDto,
  MonthlyWaitingListsResponseDto,
} from './dto/waiting-list-response.dto';
import { WaitingList } from '@prisma/client';

@Injectable()
export class WaitingListsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new waiting list for a specific date
   * @param createWaitingListDto - The data for creating a new waiting list
   * @returns The created waiting list
   * @throws BadRequestException if the date is invalid
   * @throws ConflictException if a waiting list already exists for the date
   * @throws InternalServerErrorException if the creation fails
   */
  async createWaitingList(
    createWaitingListDto: CreateWaitingListDto,
  ): Promise<WaitingListResponseDto> {
    try {
      // Validate date format
      const date = new Date(createWaitingListDto.date);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid date format. Please use YYYY-MM-DD format');
      }

      // Check if a waiting list already exists for this date
      const existingList = await this.prisma.waitingList.findUnique({
        where: { date: createWaitingListDto.date },
      });

      if (existingList) {
        throw new ConflictException(
          `A waiting list already exists for date ${createWaitingListDto.date}`,
        );
      }

      const waitingList = await this.prisma.waitingList.create({
        data: createWaitingListDto,
      });

      return this.mapToResponseDto(waitingList);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      console.error('Error creating waiting list:', error);
      throw new InternalServerErrorException('Failed to create waiting list');
    }
  }

  /**
   * Gets all waiting lists for a specific month
   * @param month - The month in YYYY-MM format
   * @returns The monthly waiting lists response
   * @throws BadRequestException if the month format is invalid
   * @throws InternalServerErrorException if the query fails
   */
  async getWaitingListsByMonth(month: string): Promise<MonthlyWaitingListsResponseDto> {
    try {
      // Validate month format
      const [year, monthNum] = month.split('-').map(Number);
      if (
        isNaN(year) ||
        isNaN(monthNum) ||
        monthNum < 1 ||
        monthNum > 12 ||
        !/^\d{4}-\d{2}$/.test(month)
      ) {
        throw new BadRequestException('Invalid month format. Please use YYYY-MM format');
      }

      // Calculate start and end dates for the month
      const startDate = new Date(year, monthNum - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];

      const waitingLists = await this.prisma.waitingList.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      return {
        month,
        waitingLists: waitingLists.map((list) => this.mapToResponseDto(list)),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error fetching waiting lists by month:', error);
      throw new InternalServerErrorException('Failed to fetch waiting lists by month');
    }
  }

  /**
   * Gets a waiting list by date
   * @param date - The date in YYYY-MM-DD format
   * @returns The waiting list for the specified date
   * @throws BadRequestException if the date format is invalid
   * @throws NotFoundException if no waiting list exists for the date
   * @throws InternalServerErrorException if the query fails
   */
  async getWaitingListByDate(date: string): Promise<WaitingListResponseDto> {
    try {
      // Validate date format
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new BadRequestException('Invalid date format. Please use YYYY-MM-DD format');
      }

      const waitingList = await this.prisma.waitingList.findUnique({
        where: { date },
      });

      if (!waitingList) {
        throw new NotFoundException(`No waiting list found for date ${date}`);
      }

      return this.mapToResponseDto(waitingList);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching waiting list by date:', error);
      throw new InternalServerErrorException('Failed to fetch waiting list by date');
    }
  }

  /**
   * Maps a Prisma WaitingList to WaitingListResponseDto
   * @param waitingList - The Prisma WaitingList object
   * @returns The mapped WaitingListResponseDto
   */
  private mapToResponseDto(waitingList: WaitingList): WaitingListResponseDto {
    const { id, date } = waitingList;
    return {
      id,
      date: date.toISOString().split('T')[0],
      maxCapacity: 0,
      currentCapacity: 0,
    };
  }
}
