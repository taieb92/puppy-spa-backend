import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new waiting list
 */
export class CreateWaitingListDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;
} 