import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { WaitingListsService } from './waiting-lists.service';
import { CreateWaitingListDto } from './dto/create-waiting-list.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

/**
 * Controller for managing waiting lists
 * Handles creation, retrieval, and management of waiting lists for the puppy spa
 */
@ApiTags('waiting-lists')
@Controller('waiting-lists')
export class WaitingListsController {
  constructor(private readonly waitingListsService: WaitingListsService) {}

  /**
   * Creates a new waiting list for a specific date
   * @param createWaitingListDto - The data for creating a new waiting list
   * @returns The created waiting list
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new waiting list' })
  @ApiBody({ type: CreateWaitingListDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Waiting list created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Waiting list already exists for this date' })
  async createWaitingList(@Body() createWaitingListDto: CreateWaitingListDto) {
    return this.waitingListsService.createWaitingList(createWaitingListDto);
  }

  /**
   * Retrieves all waiting lists with pagination
   * @param paginationDto - Pagination parameters (page and limit)
   * @returns A paginated list of waiting lists
   */
  @Get()
  @ApiOperation({ summary: 'Get all waiting lists' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Waiting lists retrieved successfully' })
  async getAllWaitingLists(@Query() paginationDto: PaginationDto) {
    return this.waitingListsService.getAllWaitingLists(paginationDto);
  }

  /**
   * Retrieves a waiting list by date
   * @param date - The date of the waiting list to retrieve
   * @returns The waiting list for the specified date
   */
  @Get('date/:date')
  @ApiOperation({ summary: 'Get a waiting list by date' })
  @ApiParam({ name: 'date', description: 'The date of the waiting list (YYYY-MM-DD)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Waiting list retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Waiting list not found for this date' })
  async getWaitingListByDate(@Param('date') date: string) {
    return this.waitingListsService.getWaitingListByDate(new Date(date));
  }
} 