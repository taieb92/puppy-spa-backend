import { IsString, IsNotEmpty, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWaitingListEntryDto {
  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  puppyName?: string;

  @IsNotEmpty()
  @IsString()
  serviceRequired: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  arrivalTime: Date;
} 