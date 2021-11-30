import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from '../event.entity';
import { EventsService } from '../events.service';
import { UserService } from '../../user/user.service';
import {
  IResponseService,
  ResponseService,
} from '../../utils/response-service';
import { CustomValidation } from '../../utils/custom-validation';
import { User } from '../../user/user.entity';
import { IEventsSubscribe } from '../interfaces/event.interface';
import { statusEnum } from '../../user/enums/status.enum';
import { EventsSubscribe } from './events-subscribe.entity';
import { ChatsService } from '../../chats/chats.service';

@Injectable()
export class EventsSubscribeService {
  constructor(
    @InjectRepository(EventsSubscribe)
    private eventsSubscribeRepository: Repository<EventsSubscribe>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => EventsService))
    private eventService: EventsService,
    private userService: UserService,
    private chatsService: ChatsService,
  ) {}

  async checkSubscriber(
    user: User,
    event: Event,
    eventOwner: User,
    isOwner: boolean,
    joinOnConfirmation: boolean | null,
  ): Promise<IEventsSubscribe> {
    if (isOwner || joinOnConfirmation === false) {
      return this.eventsSubscribeRepository.save({
        receiving: eventOwner,
        subscriber: user,
        event: event,
        status: statusEnum.CONFIRMED,
      });
    }

    return this.eventsSubscribeRepository.save({
      receiving: eventOwner,
      subscriber: user,
      event: event,
      status: statusEnum.PENDING,
    });
  }

  public async findEventSubscribe(userId: number, eventId: number) {
    return this.eventsSubscribeRepository.findOne({
      where: {
        subscriber: userId,
        event: eventId,
      },
    });
  }

  async addSubscribeOnEvent(
    subscriberId: number,
    eventId: number,
    isOwner?: boolean,
  ): Promise<IResponseService> {
    const [subscriber, event] = await Promise.all([
      this.userService.findUser(subscriberId),
      this.eventRepository.findOne(eventId, {
        relations: ['userOwner'],
      }),
    ]);

    this.userService.checkStatusAndUserFound({
      userId: subscriberId,
      user: subscriber,
    });
    this.eventService.checkEventFound(eventId, event);

    const { userOwner, joinOnConfirmation, placesLeft } = event;
    const eventOwner = await this.userService.findUser(userOwner.id);

    if (!eventOwner) {
      new CustomValidation().notFound(
        'User owner',
        'id',
        userOwner.id,
        eventOwner,
      );
    }

    const isSubscribed = await this.eventService.checkSubscribeStatus(
      subscriberId,
      eventId,
    );

    if (isSubscribed) {
      new CustomValidation().subscriptionExists();
    }

    await this.eventRepository.update(event.id, {
      placesLeft: placesLeft - 1,
    });

    await this.checkSubscriber(
      subscriber,
      event,
      userOwner,
      isOwner,
      joinOnConfirmation,
    );

    if (joinOnConfirmation === false) {
      return new ResponseService().eventSubscribed();
    }

    return new ResponseService().eventSubscribeRequest();
  }

  async getSubscribeRequests(ownerId: number): Promise<Event[]> {
    const userOwner = await this.userService.findUser(ownerId);

    if (!userOwner) {
      new CustomValidation().notFound('User owner', 'id', ownerId, userOwner);
    }

    return this.eventRepository
      .createQueryBuilder('events')
      .leftJoinAndSelect('events.files', 'files as ef')
      .leftJoinAndSelect('events.userOwner', 'userOwner')
      .leftJoinAndSelect('userOwner.files', 'files as uof')
      .where('events.userOwner.id = :id', { id: userOwner.id })
      .leftJoinAndSelect('events.subscribers', 'subscribers')
      .andWhere('subscribers.status = :status', {
        status: statusEnum.PENDING,
      })
      .leftJoinAndSelect('subscribers.subscriber', 'subscriber')
      .leftJoinAndSelect('subscriber.files', 'files as uf')
      .getMany();
  }

  async removeSubscribeOnEvent(
    subscriberId: number,
    eventId: number,
  ): Promise<IResponseService> {
    const [user, event] = await Promise.all([
      this.userService.findUser(subscriberId),
      this.eventRepository.findOne(eventId, {
        relations: ['users'],
      }),
    ]);

    const isSubscribed = await this.eventService.checkSubscribeStatus(
      subscriberId,
      eventId,
    );

    if (isSubscribed) {
      new CustomValidation().subscriptionExists();
    }

    this.userService.checkStatusAndUserFound({ userId: subscriberId, user });
    this.eventService.checkEventFound(eventId, event);

    const { placesLeft } = event;
    await this.chatsService.removeSubscribeOnChat(user, event);

    const subscriber = await this.eventsSubscribeRepository.findOne({
      where: { subscriber: user.id, event: eventId },
    });

    await this.eventsSubscribeRepository.delete(subscriber.id);
    await this.eventRepository.update(eventId, {
      placesLeft: placesLeft + 1,
    });

    return new ResponseService().unsubscribeToEvent();
  }

  async confirmRequest(
    userOwnerId: number,
    subscriberId: number,
    eventId: number,
  ): Promise<IResponseService> {
    const request = await this.eventsSubscribeRepository.findOne({
      where: {
        receiving: userOwnerId,
        subscriber: subscriberId,
        event: eventId,
      },
    });

    if (!request) {
      new CustomValidation().notFound(
        'User request',
        'id',
        subscriberId,
        request,
      );
    }

    await this.eventsSubscribeRepository.update(request.id, {
      status: statusEnum.CONFIRMED,
    });

    return new ResponseService().confirmEventRequest();
  }

  async blockUserToEvent(
    userOwnerId: number,
    blockUserId: number,
    eventId: number,
  ): Promise<IResponseService> {
    await this.eventService.checkForOwner(userOwnerId, eventId);
    const [userOwner, blockUser, event] = await Promise.all([
      this.userRepository.findOne(userOwnerId),
      this.userRepository.findOne(blockUserId),
      this.eventRepository.findOne(eventId),
    ]);

    this.userService.checkStatusAndUserFound({
      userId: userOwnerId,
      user: userOwner,
    });
    this.userService.checkStatusAndUserFound({
      userId: blockUserId,
      user: blockUser,
    });
    this.eventService.checkEventFound(eventId, event);

    const request = await this.eventsSubscribeRepository.findOne({
      where: {
        receiving: userOwnerId,
        subscriber: blockUserId,
        event: eventId,
      },
    });

    await this.eventsSubscribeRepository.update(request.id, {
      status: statusEnum.BLOCKED,
    });
    await this.permanentUserBlock(blockUser, blockUserId);

    return new ResponseService().blockUserSuccess(blockUserId, 'event');
  }

  async permanentUserBlock(
    blockUser: User,
    blockUserId: number,
  ): Promise<HttpException | User> {
    const MAX_NUMBER_OF_BLOCKS = 5;
    const numberOfBlocks = await this.eventsSubscribeRepository.find({
      where: {
        subscriber: blockUserId,
        status: statusEnum.BLOCKED,
      },
    });

    if (
      numberOfBlocks.length === MAX_NUMBER_OF_BLOCKS &&
      blockUser.status !== statusEnum.PERMANENT_BLOCKED
    ) {
      await this.userRepository.update(blockUser.id, {
        status: statusEnum.PERMANENT_BLOCKED,
      });

      new CustomValidation().userIsPermanentBlocked();
    }

    return blockUser;
  }
}
