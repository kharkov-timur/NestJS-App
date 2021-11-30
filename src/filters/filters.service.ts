import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';

import { Event } from '../events/event.entity';
import { FilterEventDto } from './dto/filter-event.dto';
import { CustomValidation } from '../utils/custom-validation';
import { IEvent } from '../events/interfaces/event.interface';
import { CheckRadiusService } from '../check-radius/check-radius.service';
import { TODAY } from '../utils/work-with-time';

@Injectable()
export class FiltersService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    private checkRadiusService: CheckRadiusService,
  ) {}

  public async getFilterEvents(
    filterEventDto: FilterEventDto,
  ): Promise<IEvent[] | HttpException | void> {
    const { userLocation, language, searchRadius, type, placesLeft } =
      filterEventDto;
    const eventsData = [];

    const events = await this.eventsRepository.find({
      where: [{ type }, { language }, { endDate: MoreThanOrEqual(TODAY) }],
      relations: ['mainImg', 'files'],
    });

    if (!events) {
      new CustomValidation().notFound('Events', 'type', type, events);
    }

    for (const event of events) {
      if (event.placesLeft > placesLeft || !placesLeft) {
        eventsData.push(event);
      }
    }

    return this.checkRadiusService.checkRadiusForEvents(
      eventsData,
      userLocation,
      searchRadius,
    );
  }
}
