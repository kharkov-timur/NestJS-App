import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RatingEvent } from './rating-event.entity';
import { Event } from '../../events/event.entity';
import { User } from '../../user/user.entity';
import { EventRatingDto } from './dto/event-rating.dto';
import { CustomValidation } from '../../utils/custom-validation';
import { IEvent } from '../../events/interfaces/event.interface';
import { RatingsService } from '../ratings.service';
import { UserService } from '../../user/user.service';
import { EventsService } from '../../events/events.service';

@Injectable()
export class RatingEventService {
  constructor(
    @InjectRepository(RatingEvent)
    private ratingEventRepository: Repository<RatingEvent>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private ratingsService: RatingsService,
    private userService: UserService,
    private eventService: EventsService,
  ) {}

  async addEventRating(
    reqUserId: number,
    { eventId, rating }: EventRatingDto,
  ): Promise<IEvent> {
    const [event, user] = await Promise.all([
      this.eventRepository.findOne(eventId, {
        relations: ['userOwner'],
      }),
      this.userRepository.findOne(reqUserId),
    ]);

    this.userService.checkStatusAndUserFound({ userId: reqUserId, user });
    this.eventService.checkEventFound(eventId, event);
    await this.eventService.checkSubscribeStatus(reqUserId, eventId, 'rating');
    this.ratingsService.checkTimeForRating(event.endDate);

    if (reqUserId === event.userOwner.id) {
      new CustomValidation().cannotToSetRating();
    }

    const eventRating = await this.ratingEventRepository.findOne({
      where: { event: eventId, user: reqUserId },
    });

    if (!eventRating) {
      await this.ratingEventRepository.save({
        user,
        event,
        rating,
      });
    }

    await this.ratingEventRepository.update(eventRating.id, {
      user,
      event,
      rating,
    });

    const allEventRatings = await this.ratingEventRepository.find({
      where: { event: eventId },
    });

    const avgRating = this.ratingsService.calculateAvgRating(
      allEventRatings,
      rating,
    );
    const result = await this.eventRepository.update(eventId, { avgRating });

    if (!result.affected) {
      new CustomValidation().resultAffected('Event', 'name', event.name);
    }

    return this.eventRepository.findOne(eventId);
  }

  async getEventRatingById(eventId: number): Promise<IEvent> {
    return this.eventRepository.findOne(eventId, {
      select: ['avgRating'],
    });
  }
}
