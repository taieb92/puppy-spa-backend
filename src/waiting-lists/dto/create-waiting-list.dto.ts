import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CreateWaitingListDto {
  @ApiProperty({
    description: 'The date of the waiting list in YYYY-MM-DD format',
    example: '2024-03-20',
  })
  @IsDateString()
  date: string;
}
