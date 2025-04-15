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

    // Find the highest position in the current list
    const highestPositionEntry = await this.prisma.waitingListEntry.findFirst({
      where: { waitingListId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = (highestPositionEntry?.position ?? 0) + 1;

    // Create the entry with the found or provided waiting list ID
    const entry = await this.prisma.waitingListEntry.create({
      data: {
        waitingListId,
        ownerName: createWaitingListEntryDto.ownerName,
        puppyName: createWaitingListEntryDto.puppyName,
        serviceRequired: createWaitingListEntryDto.serviceRequired,
        arrivalTime: new Date(createWaitingListEntryDto.arrivalTime),
        position: nextPosition,
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
      // Fetch current position of the entry with entryId
      const currentEntry = await this.prisma.waitingListEntry.findUnique({
        where: { id: entryId },
        select: { position: true, waitingListId: true },
      });

      if (!currentEntry) {
        throw new NotFoundException(`Entry with ID ${entryId} not found`);
      }

      const currentPosition = currentEntry.position;
      const newPosition = positionDto.position;

      // If newPosition is equal to currentPosition, do nothing
      if (currentPosition === newPosition) {
        const entry = await this.prisma.waitingListEntry.findUnique({ 
          where: { id: entryId }
        });
        if (!entry) {
          throw new NotFoundException(`Entry with ID ${entryId} not found`);
        }
        return this.mapToResponseDto(entry);
      }

      // Get the total number of entries to validate the new position
      const totalEntries = await this.prisma.waitingListEntry.count({
        where: { waitingListId: currentEntry.waitingListId },
      });

      if (newPosition < 1 || newPosition > totalEntries) {
        throw new ConflictException(`Position must be between 1 and ${totalEntries}`);
      }

      return await this.prisma.$transaction(async (prisma) => {
        if (newPosition < currentPosition) {
          // Moving up: increment positions of entries between new and current (inclusive new, exclusive current)
          await prisma.waitingListEntry.updateMany({
            where: {
              waitingListId: currentEntry.waitingListId,
              position: {
                gte: newPosition,
                lt: currentPosition
              }
            },
            data: {
              position: { increment: 1 }
            }
          });
        } else {
          // Moving down: decrement positions of entries between current and new (exclusive current, inclusive new)
          await prisma.waitingListEntry.updateMany({
            where: {
              waitingListId: currentEntry.waitingListId,
              position: {
                gt: currentPosition,
                lte: newPosition
              }
            },
            data: {
              position: { decrement: 1 }
            }
          });
        }

        // Set the entry's position to newPosition
        const updatedEntry = await prisma.waitingListEntry.update({
          where: { id: entryId },
          data: { position: newPosition }
        });

        return this.mapToResponseDto(updatedEntry);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Entry with ID ${entryId} not found`);
      }
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
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
