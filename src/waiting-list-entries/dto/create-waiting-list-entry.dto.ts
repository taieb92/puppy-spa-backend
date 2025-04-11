import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsNumber, Min, IsInt } from 'class-validator';

export class CreateWaitingListEntryDto {
  @ApiProperty({
    description: 'The ID of the waiting list this entry belongs to',
    example: 1,
  })
  @IsInt()
  @Min(1)
  waitingListId: number;

  @ApiProperty({
    description: 'The name of the puppy owner',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiProperty({
    description: 'The name of the puppy',
    example: 'Max',
    required: false,
  })
  @IsOptional()
  @IsString()
  puppyName?: string;

  @ApiProperty({
    description: 'The service required for the puppy',
    example: 'Grooming',
  })
  @IsString()
  serviceRequired: string;

  @ApiProperty({
    description: 'The arrival time of the puppy',
    example: '2024-03-20T10:00:00Z',
  })
  @IsDateString()
  arrivalTime: string;

  @ApiProperty({
    description: 'The desired position in the waiting list (optional)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  position?: number;
}
