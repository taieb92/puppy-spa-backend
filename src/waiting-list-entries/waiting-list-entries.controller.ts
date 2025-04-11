import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { WaitingListEntriesService } from './waiting-list-entries.service';
import { CreateWaitingListEntryDto } from './dto/create-waiting-list-entry.dto';
import { UpdateEntryStatusDto } from './dto/update-entry-status.dto';
import { UpdateEntryPositionDto } from './dto/update-entry-position.dto';
import { WaitingListEntryResponseDto } from './dto/waiting-list-entry-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { WaitingListEntry } from '@prisma/client';

/**
 * Controller for managing waiting list entries
 * Handles creation, retrieval, and management of entries in waiting lists
 */
@ApiTags('waiting-list-entries')
@Controller('waiting-lists/:listId/entries')
export class WaitingListEntriesController {
  constructor(private readonly waitingListEntriesService: WaitingListEntriesService) {}

  /**
   * Creates a new entry in a waiting list
   * @param listId - The ID of the waiting list
   * @param createEntryDto - The data for creating a new entry
   * @returns The created entry
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new entry in a waiting list',
    description: 'Creates a new entry in the specified waiting list. The entry can be added at a specific position or appended to the end of the list.',
  })
  @ApiParam({
    name: 'listId',
    description: 'The ID of the waiting list',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: CreateWaitingListEntryDto,
    description: 'The data for creating a new entry',
    examples: {
      basic: {
        value: {
          ownerName: 'John Doe',
          puppyName: 'Max',
          serviceRequired: 'Grooming',
          arrivalTime: '2024-03-20T10:00:00Z',
        },
      },
      withPosition: {
        value: {
          ownerName: 'Jane Smith',
          puppyName: 'Bella',
          serviceRequired: 'Bath',
          arrivalTime: '2024-03-20T11:00:00Z',
          position: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The entry was successfully created',
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
    @Param('listId') listId: number,
    @Body() createWaitingListEntryDto: CreateWaitingListEntryDto,
  ): Promise<WaitingListEntryResponseDto> {
    return this.waitingListEntriesService.createEntry(
      listId,
      createWaitingListEntryDto,
      createWaitingListEntryDto.position,
    );
  }

  /**
   * Gets all entries for a specific waiting list
   * @param listId - The ID of the waiting list
   * @param status - Optional status filter
   * @returns The list of entries
   */
  @Get()
  @ApiOperation({
    summary: 'Get all entries in a waiting list',
    description: 'Retrieves all entries in the specified waiting list, optionally filtered by status.',
  })
  @ApiParam({
    name: 'listId',
    description: 'The ID of the waiting list',
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter entries by status',
    required: false,
    type: 'string',
    enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    example: 'WAITING',
  })
  @ApiResponse({
    status: 200,
    description: 'The list of entries was successfully retrieved',
    type: [WaitingListEntryResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - The waiting list does not exist',
  })
  async getEntries(
    @Param('listId') listId: number,
    @Query('status') status?: string,
  ): Promise<WaitingListEntryResponseDto[]> {
    return this.waitingListEntriesService.getEntriesByListId(listId, status);
  }

  /**
   * Updates the status of a waiting list entry
   * @param entryId - The ID of the entry to update
   * @param statusDto - The new status
   * @returns The updated entry
   */
  @Put(':entryId/status')
  @ApiOperation({
    summary: 'Update the status of an entry',
    description: 'Updates the status of a specific entry in the waiting list.',
  })
  @ApiParam({
    name: 'listId',
    description: 'The ID of the waiting list',
    type: 'number',
    example: 1,
  })
  @ApiParam({
    name: 'entryId',
    description: 'The ID of the entry to update',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: UpdateEntryStatusDto,
    description: 'The new status for the entry',
    examples: {
      updateStatus: {
        value: {
          status: 'IN_PROGRESS',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The entry status was successfully updated',
    type: WaitingListEntryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - The entry does not exist',
  })
  async updateEntryStatus(
    @Param('listId') listId: number,
    @Param('entryId') entryId: number,
    @Body() updateEntryStatusDto: UpdateEntryStatusDto,
  ): Promise<WaitingListEntryResponseDto> {
    return this.waitingListEntriesService.updateEntryStatus(entryId, updateEntryStatusDto);
  }

  /**
   * Updates the position of a waiting list entry
   * @param entryId - The ID of the entry to update
   * @param positionDto - The new position
   * @returns The updated entry
   */
  @Put(':entryId/position')
  @ApiOperation({
    summary: 'Update the position of an entry',
    description: 'Updates the position of a specific entry in the waiting list. This will automatically adjust the positions of other entries.',
  })
  @ApiParam({
    name: 'listId',
    description: 'The ID of the waiting list',
    type: 'number',
    example: 1,
  })
  @ApiParam({
    name: 'entryId',
    description: 'The ID of the entry to update',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: UpdateEntryPositionDto,
    description: 'The new position for the entry',
    examples: {
      updatePosition: {
        value: {
          position: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The entry position was successfully updated',
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
    @Param('listId') listId: number,
    @Param('entryId') entryId: number,
    @Body() updateEntryPositionDto: UpdateEntryPositionDto,
  ): Promise<WaitingListEntryResponseDto> {
    return this.waitingListEntriesService.updateEntryPosition(entryId, updateEntryPositionDto);
  }

  /**
   * Removes an entry
   * @param entryId - The ID of the entry to remove
   * @returns The removed entry
   */
  @Delete(':entryId')
  @ApiOperation({
    summary: 'Remove an entry from the waiting list',
    description: 'Removes a specific entry from the waiting list. This will automatically adjust the positions of remaining entries.',
  })
  @ApiParam({
    name: 'listId',
    description: 'The ID of the waiting list',
    type: 'number',
    example: 1,
  })
  @ApiParam({
    name: 'entryId',
    description: 'The ID of the entry to remove',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'The entry was successfully removed',
    type: WaitingListEntryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - The entry does not exist',
  })
  async removeEntry(
    @Param('listId') listId: number,
    @Param('entryId') entryId: number,
  ): Promise<WaitingListEntryResponseDto> {
    return this.waitingListEntriesService.remove(entryId);
  }
} 