import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { WaitingListsModule } from '../waiting-lists/waiting-lists.module';
import { WaitingListEntriesModule } from '../waiting-list-entries/waiting-list-entries.module';

@Module({
  imports: [WaitingListsModule, WaitingListEntriesModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
