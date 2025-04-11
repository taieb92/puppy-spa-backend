import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitingListEntryDto } from './dto/create-waiting-list-entry.dto';
import { UpdateEntryStatusDto } from './dto/update-entry-status.dto';
import { UpdateEntryPositionDto } from './dto/update-entry-position.dto';
import { WaitingListEntryResponseDto } from './dto/waiting-list-entry-response.dto';
import { Prisma } from '@prisma/client';

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
  async createEntry(
    listId: number,
    entryData: Omit<CreateWaitingListEntryDto, 'waitingListId'>,
    desiredPosition?: number,
  ): Promise<WaitingListEntryResponseDto> {
    try {
      // Validate that at least one name is provided
      if (!entryData.ownerName && !entryData.puppyName) {
        throw new BadRequestException('Either ownerName or puppyName must be provided');
      }

      return await this.prisma.$transaction(async (tx) => {
        // Verify the waiting list exists
        const waitingList = await tx.waitingList.findUnique({
          where: { id: listId },
        });

        if (!waitingList) {
          throw new NotFoundException(`Waiting list with ID ${listId} not found`);
        }

        // Get the current highest position in the list
        const lastEntry = await tx.waitingListEntry.findFirst({
          where: { waitingListId: listId },
          orderBy: { position: 'desc' },
        });

        const maxPosition = lastEntry?.position ?? 0;

        // If no desired position is provided, append to the end
        if (!desiredPosition) {
          const entry = await tx.waitingListEntry.create({
            data: {
              ...entryData,
              waitingListId: listId,
              position: maxPosition + 1,
            },
          });
          return this.mapToResponseDto(entry);
        }

        // Validate desired position
        if (desiredPosition < 1 || desiredPosition > maxPosition + 1) {
          throw new ConflictException(
            `Invalid position ${desiredPosition}. Position must be between 1 and ${maxPosition + 1}`,
          );
        }

        // Shift all entries from the desired position onwards
        await tx.waitingListEntry.updateMany({
          where: {
            waitingListId: listId,
            position: {
              gte: desiredPosition,
            },
          },
          data: {
            position: {
              increment: 1,
            },
          },
        });

        // Create the new entry at the desired position
        const entry = await tx.waitingListEntry.create({
          data: {
            ...entryData,
            waitingListId: listId,
            position: desiredPosition,
          },
        });
        return this.mapToResponseDto(entry);
      });
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating entry:', error);
      throw new InternalServerErrorException('Failed to create entry');
    }
  }

  /**
   * Gets all entries for a specific waiting list, optionally filtered by status
   * @param listId - The ID of the waiting list
   * @param status - Optional status filter
   * @returns The list of entries
   * @throws NotFoundException if the waiting list doesn't exist
   * @throws InternalServerErrorException if the query fails
   */
  async getEntriesByListId(listId: number, status?: string): Promise<WaitingListEntryResponseDto[]> {
    try {
      const waitingList = await this.prisma.waitingList.findUnique({
        where: { id: listId },
      });

      if (!waitingList) {
        throw new NotFoundException(`Waiting list with ID ${listId} not found`);
      }

      const entries = await this.prisma.waitingListEntry.findMany({
        where: {
          waitingListId: listId,
          ...(status && { status }),
        },
        orderBy: {
          position: 'asc',
        },
      });

      return entries.map(this.mapToResponseDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching entries:', error);
      throw new InternalServerErrorException('Failed to fetch entries');
    }
  }

  /**
   * Updates the status of a waiting list entry
   * @param entryId - The ID of the entry to update
   * @param statusDto - The new status
   * @returns The updated entry
   * @throws NotFoundException if the entry doesn't exist
   * @throws InternalServerErrorException if the update fails
   */
  async updateEntryStatus(entryId: number, statusDto: UpdateEntryStatusDto): Promise<WaitingListEntryResponseDto> {
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
  async updateEntryPosition(entryId: number, positionDto: UpdateEntryPositionDto): Promise<WaitingListEntryResponseDto> {
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
  private mapToResponseDto(entry: any): WaitingListEntryResponseDto {
    return {
      id: entry.id,
      ownerName: entry.ownerName,
      puppyName: entry.puppyName,
      serviceRequired: entry.serviceRequired,
      arrivalTime: entry.arrivalTime,
      position: entry.position,
      status: entry.status,
    };
  }
} 