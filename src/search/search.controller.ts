import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SearchService } from './search.service';
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
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search entries across all waiting lists' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query string' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Search results retrieved successfully' })
  async search(@Query('query') query: string) {
    return this.searchService.searchEntries(query);
  }
} 