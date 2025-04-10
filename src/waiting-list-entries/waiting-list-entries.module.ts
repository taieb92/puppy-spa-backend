import { Module } from '@nestjs/common';
import { WaitingListEntriesService } from './waiting-list-entries.service';
import { WaitingListEntriesController } from './waiting-list-entries.controller';
import { WaitingListsModule } from '../waiting-lists/waiting-lists.module';

@Module({
  imports: [WaitingListsModule],
  controllers: [WaitingListEntriesController],
  providers: [WaitingListEntriesService],
  exports: [WaitingListEntriesService],
})
export class WaitingListEntriesModule {}
