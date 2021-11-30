import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from '../events/event.entity';
import { SearchEventsDto } from './dto/search-events.dto';
import { IEvent } from '../events/interfaces/event.interface';
import { CheckRadiusService } from '../check-radius/check-radius.service';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    private checkRadiusService: CheckRadiusService,
  ) {}

  private searchType = (name, type, language) => {
    if (name && !type && !language) {
      return [{ name }];
    }

    if (!name && type && !language) {
      return [{ type }];
    }

    if (!name && !type && language) {
      return { language };
    }

    if (name && type && !language) {
      return { name, type };
    }

    if (name && !type && language) {
      return { name, language };
    }

    if (!name && type && language) {
      return { type, language };
    }

    if (name && type && language) {
      return { name, type, language };
    }

    return {};
  };

  public async searchEvents(
    searchEventsDto: SearchEventsDto,
  ): Promise<IEvent[] | HttpException | void> {
    const {
      name,
      type,
      startDate,
      endDate,
      language,
      placesLeft,
      searchRadius,
      userLocation,
    } = searchEventsDto;

    let eventsData = [];

    const events = await this.eventsRepository.find({
      where: this.searchType(name, type, language),
      relations: ['mainImg', 'files'],
    });

    if (startDate && endDate) {
      for (const event of events) {
        if (startDate >= event.startDate && endDate <= event.endDate) {
          if (event.placesLeft > placesLeft || !placesLeft) {
            eventsData.push(event);
          }
        }
      }
    } else {
      eventsData = [...events];
    }

    if (searchRadius && userLocation) {
      return this.checkRadiusService.checkRadiusForEvents(
        eventsData,
        userLocation,
        searchRadius,
      );
    }

    return eventsData;
  }
}
