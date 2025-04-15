import { Controller, Get, Post, Body, Param, Delete, Put, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WaitingListEntriesService } from './waiting-list-entries.service';
import { CreateWaitingListEntryDto } from './dto/create-waiting-list-entry.dto';
import { UpdateEntryStatusDto } from './dto/update-entry-status.dto';
import { UpdateEntryPositionDto } from './dto/update-entry-position.dto';
import { WaitingListEntryResponseDto } from './dto/waiting-list-entry-response.dto';

/**
 * Controller for managing waiting list entries
 * Handles creation, retrieval, and management of entries in waiting lists
 */
@ApiTags('entries')
@Controller('entries')
export class WaitingListEntriesController {
  constructor(private readonly waitingListEntriesService: WaitingListEntriesService) {}

  /**
   * Creates a new entry in a waiting list
   * @param createWaitingListEntryDto - The data for creating a new entry
   * @returns The created entry
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new waiting list entry',
    description: 'Creates a new entry. If waitingListId is not provided, finds the list by arrivalTime date.',
  })
  @ApiResponse({
    status: 201,
    description: 'The entry has been successfully created.',
    type: WaitingListEntryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Waiting list not found for the given ID or date.',
  })
  async create(
    @Body() createWaitingListEntryDto: CreateWaitingListEntryDto,
  ): Promise<WaitingListEntryResponseDto> {
    return this.waitingListEntriesService.create(createWaitingListEntryDto);
  }

  /**
   * Gets all entries with optional listId, search query and status filter
   * @param listId - Optional ID of the waiting list
   * @param date - Optional date of the waiting list
   * @param q - Optional search query for customer name or phone number
   * @returns The list of entries
   */
  @Get('list')
  @ApiOperation({
    summary: 'Get entries with optional filters',
    description: 'Retrieves entries with optional list ID, date, and search query filters.',
  })
  @ApiQuery({
    name: 'listId',
    required: false,
    type: 'number',
    description: 'ID of the waiting list',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: 'string',
    description: 'Date of the waiting list (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: 'string',
    description: 'Search query for owner or puppy name',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all matching entries.',
    type: [WaitingListEntryResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Either listId or date must be provided',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - No waiting list found for the given ID or date',
  })
  async getEntriesByListId(
    @Query('listId') listId?: string,
    @Query('date') date?: string,
    @Query('q') searchQuery?: string,
  ): Promise<WaitingListEntryResponseDto[]> {
    if (!listId && !date) {
      throw new BadRequestException('Either listId or date must be provided');
    }

    return this.waitingListEntriesService.getEntriesByListId({ listId, date, searchQuery });
  }

  /**
   * Updates the status of a waiting list entry
   * @param id - The ID of the entry to update
   * @param statusDto - The new status
   * @returns The updated entry
   */
  @Put(':id/status')
  @ApiOperation({
    summary: 'Update the status of a waiting list entry',
    description: 'Updates the status of a specific entry in the waiting list.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the entry to update',
  })
  @ApiResponse({
    status: 200,
    description: 'The entry status has been successfully updated.',
    type: WaitingListEntryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - The entry does not exist',
  })
  async updateEntryStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateEntryStatusDto,
  ): Promise<WaitingListEntryResponseDto> {
    return this.waitingListEntriesService.updateEntryStatus(Number(id), statusDto);
  }

  /**
   * Updates the position of a waiting list entry
   * @param id - The ID of the entry to update
   * @param positionDto - The new position
   * @returns The updated entry
   */
  @Put(':id/position')
  @ApiOperation({
    summary: 'Update the position of a waiting list entry',
    description:
      'Updates the position of a specific entry in the waiting list. This will automatically adjust the positions of other entries.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the entry to update',
  })
  @ApiResponse({
    status: 200,
    description: 'The entry position has been successfully updated.',
    type: WaitingListEntryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - The entry does not exist',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Invalid position',
  })
  async updateEntryPosition(
    @Param('id') id: string,
    @Body() positionDto: UpdateEntryPositionDto,
  ): Promise<WaitingListEntryResponseDto> {
    return this.waitingListEntriesService.updateEntryPosition(Number(id), positionDto);
  }

  /**
   * Removes an entry
   * @param id - The ID of the entry to remove
   * @returns The removed entry
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Remove a waiting list entry',
    description:
      'Removes a specific entry from the waiting list. This will automatically adjust the positions of remaining entries.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the entry to remove',
  })
  @ApiResponse({
    status: 200,
    description: 'The entry has been successfully removed.',
    type: WaitingListEntryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - The entry does not exist',
  })
  async remove(@Param('id') id: string): Promise<WaitingListEntryResponseDto> {
    return this.waitingListEntriesService.remove(Number(id));
  }
}
