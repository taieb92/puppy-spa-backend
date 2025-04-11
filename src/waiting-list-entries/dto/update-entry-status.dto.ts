import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateEntryStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['waiting', 'in_progress', 'completed', 'cancelled'])
  status: string;
}
