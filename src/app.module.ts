import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { WaitingListsModule } from './waiting-lists/waiting-lists.module';
import { WaitingListEntriesModule } from './waiting-list-entries/waiting-list-entries.module';

@Module({
  imports: [PrismaModule, WaitingListsModule, WaitingListEntriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
