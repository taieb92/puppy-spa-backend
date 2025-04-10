import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('owner')
  searchByOwnerName(@Query('name') name: string) {
    return this.searchService.searchByOwnerName(name);
  }

  @Get('puppy')
  searchByPuppyName(@Query('name') name: string) {
    return this.searchService.searchByPuppyName(name);
  }

  @Get('service')
  searchByService(@Query('service') service: string) {
    return this.searchService.searchByService(service);
  }
} 