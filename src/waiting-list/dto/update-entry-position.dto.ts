import { IsInt, IsNotEmpty, Min } from 'class-validator';

/**
 * DTO for updating a waiting list entry's position
 */
export class UpdateEntryPositionDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  position: number;
} 