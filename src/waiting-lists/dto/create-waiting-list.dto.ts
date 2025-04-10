import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWaitingListDto {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;
} 