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
} from '@nestjs/common';
import { WaitingListEntriesService } from './waiting-list-entries.service';
import { CreateWaitingListEntryDto } from './dto/create-waiting-list-entry.dto';
import { UpdateEntryStatusDto } from './dto/update-entry-status.dto';
import { UpdateEntryPositionDto } from './dto/update-entry-position.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

/**
 * Controller for managing waiting list entries
 * Handles creation, retrieval, and management of entries in waiting lists
 */
@ApiTags('waiting-list-entries')
@Controller('waiting-lists/:waiting_list_id/entries')
export class WaitingListEntriesController {
  constructor(private readonly waitingListEntriesService: WaitingListEntriesService) {}

  /**
   * Creates a new entry in a waiting list
   * @param waitingListId - The ID of the waiting list
   * @param createWaitingListEntryDto - The data for creating a new entry
   * @param position - Optional desired position for the new entry
   * @returns The created entry
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new entry in a waiting list' })
  @ApiParam({ name: 'waiting_list_id', description: 'The ID of the waiting list' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Entry created successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Waiting list not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Invalid position' })
  async create(
    @Param('waiting_list_id') waitingListId: string,
    @Body() createWaitingListEntryDto: CreateWaitingListEntryDto,
    @Query('position') position?: number,
  ) {
    return this.waitingListEntriesService.createEntry(
      +waitingListId,
      createWaitingListEntryDto,
      position ? +position : undefined,
    );
  }

  /**
   * Gets all entries for a specific waiting list
   * @param waitingListId - The ID of the waiting list
   * @param status - Optional status filter
   * @returns The list of entries
   */
  @Get()
  @ApiOperation({ summary: 'Get all entries for a waiting list' })
  @ApiParam({ name: 'waiting_list_id', description: 'The ID of the waiting list' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter entries by status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Entries retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Waiting list not found' })
  async findAll(
    @Param('waiting_list_id') waitingListId: string,
    @Query('status') status?: string,
  ) {
    return this.waitingListEntriesService.getEntriesByListId(+waitingListId, status);
  }

  /**
   * Updates the status of a waiting list entry
   * @param waitingListId - The ID of the waiting list
   * @param entryId - The ID of the entry to update
   * @param updateEntryStatusDto - The new status
   * @returns The updated entry
   */
  @Patch(':entry_id/status')
  @ApiOperation({ summary: 'Update the status of a waiting list entry' })
  @ApiParam({ name: 'waiting_list_id', description: 'The ID of the waiting list' })
  @ApiParam({ name: 'entry_id', description: 'The ID of the entry' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Status updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Entry not found' })
  async updateStatus(
    @Param('waiting_list_id') waitingListId: string,
    @Param('entry_id') entryId: string,
    @Body() updateEntryStatusDto: UpdateEntryStatusDto,
  ) {
    return this.waitingListEntriesService.updateEntryStatus(+entryId, updateEntryStatusDto);
  }

  /**
   * Updates the position of a waiting list entry
   * @param waitingListId - The ID of the waiting list
   * @param entryId - The ID of the entry to update
   * @param updateEntryPositionDto - The new position
   * @returns The updated entry
   */
  @Patch(':entry_id/position')
  @ApiOperation({ summary: 'Update the position of a waiting list entry' })
  @ApiParam({ name: 'waiting_list_id', description: 'The ID of the waiting list' })
  @ApiParam({ name: 'entry_id', description: 'The ID of the entry' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Position updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Entry not found' })
  async updatePosition(
    @Param('waiting_list_id') waitingListId: string,
    @Param('entry_id') entryId: string,
    @Body() updateEntryPositionDto: UpdateEntryPositionDto,
  ) {
    return this.waitingListEntriesService.updateEntryPosition(+entryId, updateEntryPositionDto);
  }
} 