import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitingListEntryDto } from './dto/create-waiting-list-entry.dto';
import { UpdateEntryStatusDto } from './dto/update-entry-status.dto';
import { UpdateEntryPositionDto } from './dto/update-entry-position.dto';
import { WaitingListEntryResponseDto } from './dto/waiting-list-entry-response.dto';
import { Prisma, WaitingListEntry } from '@prisma/client';

interface GetEntriesParams {
  listId?: string;
  date?: string;
  searchQuery?: string;
}

@Injectable()
export class WaitingListEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new entry in a waiting list
   * @param listId - The ID of the waiting list
   * @param entryData - The data for creating a new entry
   * @param desiredPosition - Optional desired position for the new entry
   * @returns The created entry
   * @throws NotFoundException if the waiting list doesn't exist
   * @throws BadRequestException if neither ownerName nor puppyName is provided
   * @throws ConflictException if the position is invalid
   * @throws InternalServerErrorException if the creation fails
   */
  async create(createWaitingListEntryDto: CreateWaitingListEntryDto): Promise<WaitingListEntryResponseDto> {
    let waitingListId = createWaitingListEntryDto.waitingListId;

    // If waitingListId is not provided, find or create waiting list by date
    if (!waitingListId) {
      const arrivalTime = new Date(createWaitingListEntryDto.arrivalTime);
      // Reset time to midnight UTC for the same date
      const arrivalDate = new Date(Date.UTC(
        arrivalTime.getUTCFullYear(),
        arrivalTime.getUTCMonth(),
        arrivalTime.getUTCDate(),
        0, 0, 0, 0
      ));

      const waitingList = await this.prisma.waitingList.findUnique({
        where: { date: arrivalDate },
      });

      if (!waitingList) {
        throw new NotFoundException(
          `No waiting list found for date ${arrivalDate.toISOString().split('T')[0]}. Please create a waiting list first.`,
        );
      }

      waitingListId = waitingList.id;
    } else {
      // Verify the waiting list exists if ID is provided
      const waitingList = await this.prisma.waitingList.findUnique({
        where: { id: waitingListId },
      });

      if (!waitingList) {
        throw new NotFoundException(`Waiting list with ID ${waitingListId} not found`);
      }
    }

    // Create the entry with the found or provided waiting list ID
    const entry = await this.prisma.waitingListEntry.create({
      data: {
        waitingListId,
        ownerName: createWaitingListEntryDto.ownerName,
        puppyName: createWaitingListEntryDto.puppyName,
        serviceRequired: createWaitingListEntryDto.serviceRequired,
        arrivalTime: new Date(createWaitingListEntryDto.arrivalTime),
        position: 0, // Will be updated by trigger/procedure
        status: 'waiting',
      },
    });

    return this.mapToResponseDto(entry);
  }

  /**
   * Gets all entries, optionally filtered by listId, status and search query
   * @param listId - Optional ID of the waiting list
   * @param status - Optional status filter
   * @param searchQuery - Optional search query for owner or puppy name
   * @returns The list of entries
   * @throws NotFoundException if the waiting list doesn't exist
   * @throws InternalServerErrorException if the query fails
   */
  async getEntriesByListId({ listId, date, searchQuery }: GetEntriesParams): Promise<WaitingListEntryResponseDto[]> {
    let waitingListId: number | undefined;

    // If date is provided, find the waiting list ID for that date
    if (date) {
      const waitingList = await this.prisma.waitingList.findUnique({
        where: { date: new Date(date) },
      });

      if (!waitingList) {
        throw new NotFoundException(`No waiting list found for date ${date}`);
      }

      waitingListId = waitingList.id;
    } else if (listId) {
      waitingListId = Number(listId);
      
      // Verify the list exists
      const waitingList = await this.prisma.waitingList.findUnique({
        where: { id: waitingListId },
      });

      if (!waitingList) {
        throw new NotFoundException(`No waiting list found with ID ${listId}`);
      }
    }

    const where: Prisma.WaitingListEntryWhereInput = {
      ...(waitingListId && { waitingListId }),
      ...(searchQuery && {
        OR: [
          { ownerName: { contains: searchQuery } },
          { puppyName: { contains: searchQuery } },
        ],
      }),
    };

    const entries = await this.prisma.waitingListEntry.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        waitingList: {
          select: {
            date: true,
          },
        },
      },
    });

    return entries.map(this.mapToResponseDto);
  }

  /**
   * Updates the status of a waiting list entry
   * @param entryId - The ID of the entry to update
   * @param statusDto - The new status
   * @returns The updated entry
   * @throws NotFoundException if the entry doesn't exist
   * @throws InternalServerErrorException if the update fails
   */
  async updateEntryStatus(
    entryId: number,
    statusDto: UpdateEntryStatusDto,
  ): Promise<WaitingListEntryResponseDto> {
    try {
      const entry = await this.prisma.waitingListEntry.update({
        where: { id: entryId },
        data: statusDto,
      });
      return this.mapToResponseDto(entry);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Entry with ID ${entryId} not found`);
        }
      }
      console.error('Error updating entry status:', error);
      throw new InternalServerErrorException('Failed to update entry status');
    }
  }

  /**
   * Updates the position of a waiting list entry
   * @param entryId - The ID of the entry to update
   * @param positionDto - The new position
   * @returns The updated entry
   * @throws NotFoundException if the entry doesn't exist
   * @throws InternalServerErrorException if the update fails
   */
  async updateEntryPosition(
    entryId: number,
    positionDto: UpdateEntryPositionDto,
  ): Promise<WaitingListEntryResponseDto> {
    try {
      const entry = await this.prisma.waitingListEntry.update({
        where: { id: entryId },
        data: positionDto,
      });
      return this.mapToResponseDto(entry);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Entry with ID ${entryId} not found`);
        }
      }
      console.error('Error updating entry position:', error);
      throw new InternalServerErrorException('Failed to update entry position');
    }
  }

  /**
   * Removes a waiting list entry
   * @param id - The ID of the entry to remove
   * @returns The removed entry
   * @throws NotFoundException if the entry doesn't exist
   * @throws InternalServerErrorException if the deletion fails
   */
  async remove(id: number): Promise<WaitingListEntryResponseDto> {
    try {
      const entry = await this.prisma.waitingListEntry.delete({
        where: { id },
      });
      return this.mapToResponseDto(entry);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Entry with ID ${id} not found`);
        }
      }
      console.error('Error removing entry:', error);
      throw new InternalServerErrorException('Failed to remove entry');
    }
  }

  /**
   * Maps a Prisma WaitingListEntry to WaitingListEntryResponseDto
   * @param entry - The Prisma WaitingListEntry object
   * @returns The mapped WaitingListEntryResponseDto
   */
  private mapToResponseDto(entry: WaitingListEntry): WaitingListEntryResponseDto {
    return {
      id: entry.id,
      waitingListId: entry.waitingListId,
      ownerName: entry.ownerName || '',
      puppyName: entry.puppyName || '',
      serviceRequired: entry.serviceRequired,
      createdAt: entry.createdAt,
    };
  }
}
