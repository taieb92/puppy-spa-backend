import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WaitingListsService } from './waiting-lists.service';
import { CreateWaitingListDto } from './dto/create-waiting-list.dto';
import {
  WaitingListResponseDto,
  MonthlyWaitingListsResponseDto,
} from './dto/waiting-list-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

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
  @ApiOperation({
    summary: 'Create a new waiting list',
    description:
      'Creates a new waiting list for a specific date. The date must be in YYYY-MM-DD format.',
  })
  @ApiBody({
    type: CreateWaitingListDto,
    description: 'The data for creating a new waiting list',
    examples: {
      basic: {
        value: {
          date: '2024-03-20',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The waiting list was successfully created',
    type: WaitingListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid date format',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - A waiting list already exists for this date',
  })
  async createWaitingList(
    @Body() createWaitingListDto: CreateWaitingListDto,
  ): Promise<WaitingListResponseDto> {
    return this.waitingListsService.createWaitingList(createWaitingListDto);
  }

  /**
   * Retrieves waiting lists by month
   * @param month - The month in YYYY-MM format
   * @returns A list of waiting lists for the specified month
   */
  @Get('month/:month')
  @ApiOperation({
    summary: 'Get waiting lists by month',
    description:
      'Retrieves all waiting lists for a specific month. The month must be in YYYY-MM format.',
  })
  @ApiParam({
    name: 'month',
    description: 'The month to retrieve waiting lists for (YYYY-MM format)',
    required: true,
    type: 'string',
    example: '2024-03',
  })
  @ApiResponse({
    status: 200,
    description: 'The waiting lists for the specified month were successfully retrieved',
    type: MonthlyWaitingListsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid month format',
  })
  async getAllWaitingLists(@Param('month') month: string): Promise<MonthlyWaitingListsResponseDto> {
    return this.waitingListsService.getWaitingListsByMonth(month);
  }

  /**
   * Retrieves a waiting list by date
   * @param date - The date of the waiting list to retrieve
   * @returns The waiting list for the specified date
   */
  @Get('date/:date')
  @ApiOperation({
    summary: 'Get a waiting list by date',
    description:
      'Retrieves a specific waiting list by its date. The date must be in YYYY-MM-DD format.',
  })
  @ApiParam({
    name: 'date',
    description: 'The date of the waiting list to retrieve (YYYY-MM-DD format)',
    type: 'string',
    example: '2024-03-20',
  })
  @ApiResponse({
    status: 200,
    description: 'The waiting list was successfully retrieved',
    type: WaitingListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid date format',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - No waiting list exists for this date',
  })
  async getWaitingListByDate(@Param('date') date: string): Promise<WaitingListResponseDto> {
    return this.waitingListsService.getWaitingListByDate(date);
  }
}
