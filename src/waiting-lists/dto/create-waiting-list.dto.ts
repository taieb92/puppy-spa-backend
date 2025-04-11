import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Min, Max } from 'class-validator';

export class CreateWaitingListDto {
  @ApiProperty({
    description: 'The date of the waiting list in YYYY-MM-DD format',
    example: '2024-03-20',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'The maximum capacity of the waiting list',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  maxCapacity: number;

  @ApiProperty({
    description: 'The current number of entries in the waiting list',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  currentCapacity: number;
}
