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

// Define the status enum for consistency
export enum EntryStatus {
  WAITING = 'WAITING',
  COMPLETED = 'COMPLETED',
}

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
  async create(
    createEntryDto: CreateWaitingListEntryDto,
  ): Promise<WaitingListEntryResponseDto> {
    try {
      let waitingListId = createEntryDto.waitingListId;
      
      if (!waitingListId) {
        // Extract date from arrivalTime and reset time to midnight
        const arrivalDate = new Date(createEntryDto.arrivalTime);
        arrivalDate.setHours(0, 0, 0, 0);
        
        // Find waiting list by date
        const waitingList = await this.prisma.waitingList.findFirst({
          where: {
            date: arrivalDate,
          },
        });
        
        if (!waitingList) {
          throw new NotFoundException(
            `No waiting list found for date ${arrivalDate.toISOString().split('T')[0]}. Please create a waiting list first.`,
          );
        }
        
        waitingListId = waitingList.id;
      } else {
        // Verify waitingList exists if ID was provided
        const waitingList = await this.prisma.waitingList.findUnique({
          where: { id: waitingListId },
        });
        
        if (!waitingList) {
          throw new NotFoundException(
            `Waiting list with ID ${waitingListId} not found`,
          );
        }
      }

      // Get highest position in waiting list
      const highestPositionEntry = await this.prisma.waitingListEntry.findFirst({
        where: {
          waitingListId,
        },
        orderBy: {
          position: 'desc',
        },
      });

      const position = highestPositionEntry ? highestPositionEntry.position + 1 : 1;

      const entry = await this.prisma.waitingListEntry.create({
        data: {
          waitingListId,
          position,
          status: EntryStatus.WAITING,
          arrivalTime: new Date(createEntryDto.arrivalTime),
          ownerName: createEntryDto.ownerName,
          puppyName: createEntryDto.puppyName,
          serviceRequired: createEntryDto.serviceRequired,
        },
      });

      return this.mapToResponseDto(entry);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create entry: ${error.message}`,
      );
    }
  }

  /**
   * Gets entries with optional filters
   * @param params - Optional parameters for filtering entries
   * @returns The list of entries
   */
  async getEntries({ listId, date, searchQuery }: GetEntriesParams): Promise<WaitingListEntryResponseDto[]> {
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
      
      // Verify the list exists if listId is provided
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
      orderBy: [
        { waitingListId: 'asc' },
        { position: 'asc' }
      ],
    });

    return entries.map(this.mapToResponseDto);
  }

  /**
   * Updates the status of a waiting list entry
   * @param id - The ID of the entry to update
   * @param updateEntryStatusDto - The new status
   * @returns The updated entry
   * @throws NotFoundException if the entry doesn't exist
   * @throws InternalServerErrorException if the update fails
   */
  async updateEntryStatus(
    id: number,
    updateEntryStatusDto: UpdateEntryStatusDto,
  ): Promise<WaitingListEntryResponseDto> {
    try {
      const entry = await this.prisma.waitingListEntry.findUnique({
        where: { id },
      });

      if (!entry) {
        throw new NotFoundException(`Entry with ID ${id} not found`);
      }

      const updatedEntry = await this.prisma.waitingListEntry.update({
        where: { id },
        data: {
          status: updateEntryStatusDto.status,
        },
      });

      return this.mapToResponseDto(updatedEntry);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update entry status: ${error.message}`,
      );
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
      position: entry.position,
      status: entry.status,
      arrivalTime: entry.arrivalTime,
      createdAt: entry.createdAt,
    };
  }
}
