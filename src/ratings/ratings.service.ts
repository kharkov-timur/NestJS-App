import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { Event } from '../events/event.entity';
import { CustomValidation } from '../utils/custom-validation';
import { EventsSubscribe } from '../events/events-subscribe/events-subscribe.entity';
import { expireDateSetRating, TODAY } from '../utils/work-with-time';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(EventsSubscribe)
    private eventsSubscribeRepository: Repository<EventsSubscribe>,
  ) {}

  public checkTimeForRating(endDate: Date): HttpException | void {
    const expireDate = expireDateSetRating(endDate);

    if (TODAY > expireDate) {
      new CustomValidation().cannotToSetRating(endDate);
    }
  }

  public calculateAvgRating(allRatings: any, rating: number): string {
    let sum = 0;
    allRatings.forEach((item) => (sum += item.rating));

    return (allRatings.length ? sum / allRatings.length : rating).toString();
  }
}
