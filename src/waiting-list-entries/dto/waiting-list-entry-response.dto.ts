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

  @ApiProperty({ description: 'The required service' })
  serviceRequired: string;

  @ApiProperty({ description: 'The creation date of the entry' })
  createdAt: Date;
}
