import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateEntryPositionDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  position: number;
}
