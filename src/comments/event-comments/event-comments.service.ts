import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventComments } from './event-comments.entity';
import { CreateEventCommentsDto } from '../dto/create-event-comments.dto';
import {
  IResponseService,
  ResponseService,
} from '../../utils/response-service';
import { UserService } from '../../user/user.service';
import { EventsService } from '../../events/events.service';
import { User } from '../../user/user.entity';
import { Event } from '../../events/event.entity';
import { UpdateEventCommentsDto } from '../dto/update-event-comments.dto';
import { EventsSubscribe } from '../../events/events-subscribe/events-subscribe.entity';
import { CustomValidation } from '../../utils/custom-validation';
import { DeleteEventCommentsDto } from '../dto/delete-event-comments.dto';

@Injectable()
export class EventCommentsService {
  constructor(
    @InjectRepository(EventComments)
    private eventCommentsRepository: Repository<EventComments>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(EventsSubscribe)
    private eventsSubscribeRepository: Repository<EventsSubscribe>,
    private userService: UserService,
    private eventsService: EventsService,
  ) {}

  async getAllComments(
    reqUserId: number,
    eventId: number,
  ): Promise<EventComments[]> {
    const user = await this.userRepository.findOne(reqUserId);
    this.userService.checkStatusAndUserFound({ user, userId: reqUserId });

    return this.eventCommentsRepository.find({
      where: { event: eventId },
      relations: ['author', 'author.files'],
    });
  }

  async getOneComment(
    reqUserId: number,
    commentId: number,
  ): Promise<EventComments> {
    return this.eventCommentsRepository.findOne(commentId, {
      where: { author: reqUserId },
      relations: ['author', 'author.files'],
    });
  }

  async createComment(
    authorId: number,
    { eventId, text }: CreateEventCommentsDto,
  ): Promise<EventComments> {
    const [author, event] = await Promise.all([
      this.userRepository.findOne(authorId),
      this.eventRepository.findOne(eventId, {
        relations: ['userOwner'],
      }),
    ]);

    await this.eventsService.checkSubscribeStatus(authorId, eventId, 'comment');
    this.userService.checkStatusAndUserFound({
      user: author,
      userId: authorId,
    });
    this.eventsService.checkEventFound(eventId, event);

    if (authorId === event.userOwner.id) {
      new CustomValidation().cannotToSetComment();
    }

    const newComment = await this.eventCommentsRepository.save({
      author,
      event,
      text,
    });

    return this.eventCommentsRepository.findOne(newComment.id, {
      where: { author: authorId, event: eventId },
      relations: ['author', 'author.files'],
    });
  }

  async updateComment(
    reqUserId: number,
    commentId: number,
    { eventId, text }: UpdateEventCommentsDto,
  ): Promise<EventComments> {
    const comment = await this.eventCommentsRepository.findOne(commentId, {
      where: { author: reqUserId, event: eventId },
    });

    if (!comment) {
      new CustomValidation().notFound('Comment', 'id', commentId, comment);
    }

    await this.eventsService.checkSubscribeStatus(
      reqUserId,
      eventId,
      'comment',
    );

    await this.eventCommentsRepository.update(comment.id, { text });

    return this.eventCommentsRepository.findOne(commentId);
  }

  async deleteComment(
    reqUserId: number,
    commentId: number,
    { eventId }: DeleteEventCommentsDto,
  ): Promise<IResponseService> {
    const comment = await this.eventCommentsRepository.findOne(commentId, {
      relations: ['author'],
    });

    if (!comment) {
      new CustomValidation().notFound('Comment', 'id', commentId, comment);
    }

    const event = await this.eventRepository.findOne(eventId, {
      relations: ['userOwner'],
    });
    this.eventsService.checkEventFound(eventId, event);

    if (reqUserId !== event.userOwner.id && reqUserId !== comment.author.id) {
      new CustomValidation().cannotToDeleteComment();
    }

    await this.eventCommentsRepository.delete(comment.id);

    return new ResponseService().deleteCommentSuccess();
  }
}
