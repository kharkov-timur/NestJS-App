import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RatingUser } from './rating-user.entity';
import { Event } from '../../events/event.entity';
import { User } from '../../user/user.entity';
import { UserRatingDto } from './dto/user-rating.dto';
import { IUser } from '../../user/interfaces/user.intarface';
import { CustomValidation } from '../../utils/custom-validation';
import { RatingsService } from '../ratings.service';
import { UserService } from '../../user/user.service';
import { EventsService } from '../../events/events.service';

@Injectable()
export class RatingUserService {
  constructor(
    @InjectRepository(RatingUser)
    private ratingUserOwnerRepository: Repository<RatingUser>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private ratingsService: RatingsService,
    private userService: UserService,
    private eventService: EventsService,
  ) {}

  public async addUserRating(
    reqUserId: number,
    { receivingUserId, eventId, rating }: UserRatingDto,
  ): Promise<IUser> {
    const [receivingUser, sendingUser, event] = await Promise.all([
      this.userRepository.findOne(receivingUserId),
      this.userRepository.findOne(reqUserId),
      this.eventRepository.findOne(eventId),
    ]);

    this.userService.checkStatusAndUserFound({
      userId: receivingUserId,
      user: receivingUser,
    });
    this.userService.checkStatusAndUserFound({
      userId: reqUserId,
      user: sendingUser,
    });
    this.eventService.checkEventFound(eventId, event);

    this.ratingsService.checkTimeForRating(event.endDate);

    if (sendingUser.id === receivingUser.id) {
      new CustomValidation().cannotToSetRating();
    }

    await Promise.all([
      await this.eventService.checkSubscribeStatus(
        reqUserId,
        eventId,
        'rating',
      ),
      await this.eventService.checkSubscribeStatus(
        receivingUserId,
        eventId,
        'rating',
      ),
    ]);

    return this.setUserRating(sendingUser, receivingUser, rating);
  }

  private async setUserRating(
    sendingUser: User,
    receivingUser: User,
    rating: number,
  ): Promise<IUser> {
    const userRating = await this.ratingUserOwnerRepository.findOne({
      where: { sendingUser: sendingUser.id, receivingUser: receivingUser.id },
    });

    if (!userRating) {
      await this.ratingUserOwnerRepository.save({
        sendingUser: sendingUser,
        receivingUser: receivingUser,
        rating,
      });
    }

    await this.ratingUserOwnerRepository.update(userRating.id, {
      sendingUser: sendingUser,
      receivingUser: receivingUser,
      rating,
    });

    const allUserRatings = await this.ratingUserOwnerRepository.find({
      where: { receivingUser: receivingUser.id },
    });

    const avgRating = this.ratingsService.calculateAvgRating(
      allUserRatings,
      rating,
    );

    const result = await this.userRepository.update(receivingUser.id, {
      avgRating,
    });

    if (!result.affected) {
      new CustomValidation().resultAffected('User', 'name', receivingUser.name);
    }

    return this.userRepository.findOne(receivingUser.id);
  }

  public async getUserRatingById(userId: number): Promise<IUser> {
    return this.userRepository.findOne(userId, {
      select: ['avgRating'],
    });
  }
}
