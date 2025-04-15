import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntryStatus } from '../waiting-list-entries.service';

export class UpdateEntryStatusDto {
  @ApiProperty({
    enum: EntryStatus,
    description: 'The status of the entry (WAITING or COMPLETED)',
    example: EntryStatus.COMPLETED
  })
  @IsEnum(EntryStatus)
  status: EntryStatus;
}
