import { IsString, IsNotEmpty, IsDate, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  position: number;

  @IsNotEmpty()
  @IsInt()
  waitingListId: number;
} 