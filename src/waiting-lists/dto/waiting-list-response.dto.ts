import { ApiProperty } from '@nestjs/swagger';

export class WaitingListResponseDto {
  @ApiProperty({ description: 'The unique identifier of the waiting list' })
  id: number;

  @ApiProperty({ description: 'The date of the waiting list in YYYY-MM-DD format' })
  date: string;

  @ApiProperty({ description: 'The maximum capacity of the waiting list' })
  maxCapacity: number;

  @ApiProperty({ description: 'The current number of entries in the waiting list' })
  currentCapacity: number;
}

export class MonthlyWaitingListsResponseDto {
  @ApiProperty({ description: 'The month in YYYY-MM format' })
  month: string;

  @ApiProperty({
    description: 'List of waiting lists for the month',
    type: [WaitingListResponseDto],
  })
  waitingLists: WaitingListResponseDto[];
}
