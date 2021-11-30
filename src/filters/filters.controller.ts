import {
  Body,
  Controller,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { FiltersService } from './filters.service';
import { FilterEventDto } from './dto/filter-event.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { IEvent } from '../events/interfaces/event.interface';

@ApiTags('Filters')
@Controller('filters')
export class FiltersController {
  constructor(private filterService: FiltersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/events')
  async getFilterEvents(
    @Body() filterEventDto: FilterEventDto,
  ): Promise<IEvent[] | HttpException | void> {
    return this.filterService.getFilterEvents(filterEventDto);
  }
}
