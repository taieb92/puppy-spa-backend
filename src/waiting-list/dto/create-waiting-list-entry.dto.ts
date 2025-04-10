import { IsString, IsNotEmpty, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a new waiting list entry
 */
export class CreateWaitingListEntryDto {
  @IsNotEmpty()
  @IsString()
  ownerName: string;

  @IsNotEmpty()
  @IsString()
  puppyName: string;

  @IsNotEmpty()
  @IsString()
  serviceRequired: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  arrivalTime: Date;
} 