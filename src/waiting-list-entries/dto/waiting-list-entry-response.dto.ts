import { ApiProperty } from '@nestjs/swagger';

export class WaitingListEntryResponseDto {
  @ApiProperty({ description: 'The unique identifier of the entry' })
  id: number;

  @ApiProperty({ description: 'The name of the owner', nullable: true })
  ownerName: string | null;

  @ApiProperty({ description: 'The name of the puppy', nullable: true })
  puppyName: string | null;

  @ApiProperty({ description: 'The service required for the puppy' })
  serviceRequired: string;

  @ApiProperty({ description: 'The arrival time of the puppy' })
  arrivalTime: Date;

  @ApiProperty({ description: 'The position in the waiting list' })
  position: number;

  @ApiProperty({ description: 'The current status of the entry' })
  status: string;
}
