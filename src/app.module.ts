import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { WaitingListsModule } from './waiting-lists/waiting-lists.module';
import { WaitingListEntriesModule } from './waiting-list-entries/waiting-list-entries.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [PrismaModule, WaitingListsModule, WaitingListEntriesModule, SearchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
