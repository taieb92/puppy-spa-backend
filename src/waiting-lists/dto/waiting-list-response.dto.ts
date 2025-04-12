import { ApiProperty } from '@nestjs/swagger';

export class WaitingListResponseDto {
  @ApiProperty({ description: 'The unique identifier of the waiting list' })
  id: number;

  @ApiProperty({ description: 'The date of the waiting list in YYYY-MM-DD format' })
  date: string;
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
