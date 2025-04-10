import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitingListEntryDto } from './dto/create-waiting-list-entry.dto';
import { UpdateEntryStatusDto } from './dto/update-entry-status.dto';
import { UpdateEntryPositionDto } from './dto/update-entry-position.dto';
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
   */
  async createEntry(
    listId: number,
    entryData: Omit<CreateWaitingListEntryDto, 'waitingListId'>,
    desiredPosition?: number,
  ) {
    // Validate that at least one name is provided
    if (!entryData.ownerName && !entryData.puppyName) {
      throw new BadRequestException('Either ownerName or puppyName must be provided');
    }

    try {
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
          return tx.waitingListEntry.create({
            data: {
              ...entryData,
              waitingListId: listId,
              position: maxPosition + 1,
            },
            include: {
              waitingList: true,
            },
          });
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
        return tx.waitingListEntry.create({
          data: {
            ...entryData,
            waitingListId: listId,
            position: desiredPosition,
          },
          include: {
            waitingList: true,
          },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException(`Waiting list with ID ${listId} not found`);
        }
      }
      throw error;
    }
  }

  /**
   * Gets all entries for a specific waiting list, optionally filtered by status
   * @param listId - The ID of the waiting list
   * @param status - Optional status filter
   * @returns The list of entries
   * @throws NotFoundException if the waiting list doesn't exist
   */
  async getEntriesByListId(listId: number, status?: string) {
    const waitingList = await this.prisma.waitingList.findUnique({
      where: { id: listId },
    });

    if (!waitingList) {
      throw new NotFoundException(`Waiting list with ID ${listId} not found`);
    }

    return this.prisma.waitingListEntry.findMany({
      where: {
        waitingListId: listId,
        ...(status && { status }),
      },
      orderBy: {
        position: 'asc',
      },
      include: {
        waitingList: true,
      },
    });
  }

  /**
   * Updates the status of a waiting list entry
   * @param entryId - The ID of the entry to update
   * @param statusDto - The new status
   * @returns The updated entry
   * @throws NotFoundException if the entry doesn't exist
   */
  async updateEntryStatus(entryId: number, statusDto: UpdateEntryStatusDto) {
    try {
      return await this.prisma.waitingListEntry.update({
        where: { id: entryId },
        data: statusDto,
        include: {
          waitingList: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Entry with ID ${entryId} not found`);
        }
      }
      throw error;
    }
  }

  /**
   * Updates the position of a waiting list entry
   * @param entryId - The ID of the entry to update
   * @param positionDto - The new position
   * @returns The updated entry
   * @throws NotFoundException if the entry doesn't exist
   */
  async updateEntryPosition(entryId: number, positionDto: UpdateEntryPositionDto) {
    try {
      return await this.prisma.waitingListEntry.update({
        where: { id: entryId },
        data: positionDto,
        include: {
          waitingList: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Entry with ID ${entryId} not found`);
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    return this.prisma.waitingListEntry.delete({
      where: { id },
    });
  }
} 