import { ApiProperty } from '@nestjs/swagger';

export class WaitingListEntryResponseDto {
  @ApiProperty({ description: 'The unique identifier of the entry' })
  id: number;

  @ApiProperty({ description: 'The ID of the waiting list this entry belongs to' })
  waitingListId: number;

  @ApiProperty({ description: 'The name of the owner' })
  ownerName: string;

  @ApiProperty({ description: 'The name of the puppy' })
  puppyName: string;

  @ApiProperty({ description: 'The service required for the puppy' })
  serviceRequired: string;

  @ApiProperty({ description: 'The position in the waiting list' })
  position: number;

  @ApiProperty({ description: 'The status of the entry' })
  status: string;

  @ApiProperty({ description: 'The arrival time of the entry' })
  arrivalTime: Date;

  @ApiProperty({ description: 'When the entry was created' })
  createdAt: Date;
}
