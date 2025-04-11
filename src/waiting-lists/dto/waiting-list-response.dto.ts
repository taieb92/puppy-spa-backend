import { ApiProperty } from '@nestjs/swagger';
import { WaitingListEntryResponseDto } from '../../waiting-list-entries/dto/waiting-list-entry-response.dto';

export class WaitingListResponseDto {
  @ApiProperty({ description: 'The unique identifier of the waiting list' })
  id: number;

  @ApiProperty({ description: 'The date of the waiting list' })
  date: Date;

  @ApiProperty({ 
    description: 'The entries in the waiting list',
    type: [WaitingListEntryResponseDto]
  })
  entries: WaitingListEntryResponseDto[];
}

export class MonthlyWaitingListsResponseDto {
  @ApiProperty({ 
    description: 'The list of waiting lists for the specified month',
    type: [WaitingListResponseDto]
  })
  waitingLists: WaitingListResponseDto[];

  @ApiProperty({ description: 'The month and year in YYYY-MM format' })
  month: string;
} 