import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateEntryStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['WAITING',  'COMPLETED'])
  status: string;
}
