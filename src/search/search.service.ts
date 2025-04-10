import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Searches for entries across all waiting lists
   * @param query - The search query string
   * @returns Matching entries with their associated waiting lists
   */
  async searchEntries(query: string) {
    if (!query || query.trim() === '') {
      return [];
    }

    const searchQuery = query.trim();

    return this.prisma.waitingListEntry.findMany({
      where: {
        OR: [
          {
            ownerName: {
              contains: searchQuery,
            },
          },
          {
            puppyName: {
              contains: searchQuery,
            },
          },
          {
            serviceRequired: {
              contains: searchQuery,
            },
          },
        ],
      },
      include: {
        waitingList: true,
      },
      orderBy: [
        {
          waitingList: {
            date: 'desc',
          },
        },
        {
          position: 'asc',
        },
      ],
    });
  }
} 