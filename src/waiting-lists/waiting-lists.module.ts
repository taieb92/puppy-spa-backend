import { Module } from '@nestjs/common';
import { WaitingListsService } from './waiting-lists.service';
import { WaitingListsController } from './waiting-lists.controller';

@Module({
  controllers: [WaitingListsController],
  providers: [WaitingListsService],
  exports: [WaitingListsService],
})
export class WaitingListsModule {}
