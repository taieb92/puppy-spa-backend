import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { WaitingListEntriesService } from './waiting-list-entries.service';
import { CreateWaitingListEntryDto } from './dto/create-waiting-list-entry.dto';
import { UpdateEntryStatusDto } from './dto/update-entry-status.dto';
import { UpdateEntryPositionDto } from './dto/update-entry-position.dto';

@Controller('waiting-list-entries')
export class WaitingListEntriesController {
  constructor(private readonly waitingListEntriesService: WaitingListEntriesService) {}

  @Post()
  create(@Body() createWaitingListEntryDto: CreateWaitingListEntryDto) {
    return this.waitingListEntriesService.create(createWaitingListEntryDto);
  }

  @Get()
  findAll() {
    return this.waitingListEntriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.waitingListEntriesService.findOne(+id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateEntryStatusDto: UpdateEntryStatusDto,
  ) {
    return this.waitingListEntriesService.updateStatus(+id, updateEntryStatusDto);
  }

  @Patch(':id/position')
  updatePosition(
    @Param('id') id: string,
    @Body() updateEntryPositionDto: UpdateEntryPositionDto,
  ) {
    return this.waitingListEntriesService.updatePosition(+id, updateEntryPositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.waitingListEntriesService.remove(+id);
  }
} 