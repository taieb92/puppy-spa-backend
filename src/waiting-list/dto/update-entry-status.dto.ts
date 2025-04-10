import { IsString, IsNotEmpty, IsIn } from 'class-validator';

/**
 * DTO for updating a waiting list entry's status
 */
export class UpdateEntryStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['waiting', 'in_progress', 'completed', 'cancelled'])
  status: string;
} 