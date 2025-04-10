import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WaitingListsService } from './waiting-lists.service';
import { CreateWaitingListDto } from './dto/create-waiting-list.dto';

@Controller('waiting-lists')
export class WaitingListsController {
  constructor(private readonly waitingListsService: WaitingListsService) {}

  @Post()
  create(@Body() createWaitingListDto: CreateWaitingListDto) {
    return this.waitingListsService.create(createWaitingListDto);
  }

  @Get()
  findAll() {
    return this.waitingListsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.waitingListsService.findOne(+id);
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    return this.waitingListsService.findByDate(new Date(date));
  }
} 