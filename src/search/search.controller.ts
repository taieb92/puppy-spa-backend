import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { WaitingListEntryResponseDto } from '../waiting-list-entries/dto/waiting-list-entry-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

/**
 * Controller for searching waiting list entries
 * Handles search operations across all waiting lists
 */
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Searches for entries across all waiting lists
   * @param query - The search query string
   * @returns Matching entries with their associated waiting lists
   */
  @Get('entries')
  @ApiOperation({
    summary: 'Search entries across all waiting lists',
    description: 'Searches for entries across all waiting lists based on the provided query. The search is performed on owner name, puppy name, and service required fields.',
  })
  @ApiQuery({
    name: 'q',
    description: 'The search query',
    required: true,
    type: 'string',
    example: 'Max',
  })
  @ApiResponse({
    status: 200,
    description: 'The search results were successfully retrieved',
    type: [WaitingListEntryResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to perform search',
  })
  async searchEntries(@Query('q') query: string): Promise<WaitingListEntryResponseDto[]> {
    return this.searchService.searchEntries(query);
  }
} 