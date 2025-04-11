import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WaitingListEntryResponseDto } from '../waiting-list-entries/dto/waiting-list-entry-response.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Searches for entries across multiple fields
   * @param query - The search query
   * @returns List of matching entries
   * @throws InternalServerErrorException if the search fails
   */
  async searchEntries(query: string): Promise<WaitingListEntryResponseDto[]> {
    try {
      if (!query) {
        return [];
      }

      const entries = await this.prisma.waitingListEntry.findMany({
        where: {
          OR: [
            { ownerName: { contains: query } },
            { puppyName: { contains: query } },
            { serviceRequired: { contains: query } },
          ],
        },
        include: {
          waitingList: true,
        },
      });

      return entries.map((entry) => ({
        id: entry.id,
        ownerName: entry.ownerName,
        puppyName: entry.puppyName,
        serviceRequired: entry.serviceRequired,
        arrivalTime: entry.arrivalTime,
        position: entry.position,
        status: entry.status,
      }));
    } catch (error) {
      console.error('Error searching entries:', error);
      throw new InternalServerErrorException('Failed to search entries');
    }
  }
}
