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
   * @param desiredPosition - Optional position for the new entry
   * @returns The created entry
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new waiting list entry',
    description: 'Creates a new entry in the specified waiting list.',
  })
  @ApiResponse({
    status: 201,
    description: 'The entry has been successfully created.',
    type: WaitingListEntryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or missing required fields',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - The waiting list does not exist',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Invalid position or other conflict',
  })
  async createEntry(
    @Body() createWaitingListEntryDto: CreateWaitingListEntryDto,
    @Query('position') desiredPosition?: number,
  ): Promise<WaitingListEntryResponseDto> {
    return this.waitingListEntriesService.createEntry(
      createWaitingListEntryDto.waitingListId,
      createWaitingListEntryDto,
      desiredPosition,
    );
  }

  /**
   * Gets all entries with optional listId, search query and status filter
   * @param listId - Optional ID of the waiting list
   * @param q - Optional search query for owner or puppy name
   * @param status - Optional status filter
   * @returns The list of entries
   */
  @Get('list')
  @ApiOperation({
    summary: 'Get all entries with optional filters',
    description:
      'Retrieves all entries, optionally filtered by list, status and search query.',
  })
  @ApiQuery({
    name: 'listId',
    description: 'Optional ID of the waiting list',
    required: false,
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search query for owner or puppy name',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter entries by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all matching entries.',
    type: [WaitingListEntryResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - The waiting list does not exist',
  })
  async getEntriesByListId(
    @Query('listId') listId?: string,
    @Query('q') searchQuery?: string,
    @Query('status') status?: string,
  ): Promise<WaitingListEntryResponseDto[]> {
    return this.waitingListEntriesService.getEntriesByListId(
      listId ? Number(listId) : undefined,
      status,
      searchQuery,
    );
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
