import {
  Body,
  Controller,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { SearchEventsDto } from './dto/search-events.dto';
import { IEvent } from '../events/interfaces/event.interface';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/events')
  async searchEvents(
    @Body() searchEventsDto: SearchEventsDto,
  ): Promise<IEvent[] | HttpException | void> {
    return this.searchService.searchEvents(searchEventsDto);
  }
}
