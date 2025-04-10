import { IsString, IsNotEmpty, IsDate, IsInt, Min, IsOptional, ValidateIf } from 'class-validator';
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

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  position: number;

  @IsNotEmpty()
  @IsInt()
  waitingListId: number;

  // Custom validation to ensure at least one of ownerName or puppyName is provided
  validateAtLeastOneName() {
    return !!(this.ownerName || this.puppyName);
  }
} 