import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { statusEnum } from '../user/enums/status.enum';
import { roleEnum } from '../user/enums/role.enum';
import { File } from '../files/files.entity';
import { IUser } from '../user/interfaces/user.intarface';
import { IEvent } from '../events/interfaces/event.interface';
import { IChat } from '../chats/interfaces/chat.interface';
import { User } from '../user/user.entity';
import { Chat } from '../chats/chats.entity';
import { Friends } from '../friends/friends.entity';
import { IDevice } from '../push-notification/device/interfaces/device.interface';
import { Monitor } from '../events/monitor/monitor.entity';
import { EventsSubscribe } from '../events/events-subscribe/events-subscribe.entity';
import { EventComments } from '../comments/event-comments/event-comments.entity';

export class CustomValidation {
  notFound(
    entityName: string,
    fieldName: string,
    fieldValue: string | number,
    searchResult:
      | IUser
      | IEvent
      | IEvent[]
      | File
      | IChat
      | Friends
      | IDevice
      | IDevice[]
      | Monitor
      | EventsSubscribe
      | EventComments
      | boolean,
    deleteResult?: DeleteResult,
  ): HttpException | void {
    if (
      (!searchResult && !deleteResult) ||
      (!searchResult && !deleteResult.affected)
    ) {
      throw new NotFoundException(
        `${entityName} with ${fieldName}: ${fieldValue} not found`,
      );
    }
  }

  userIsRemoved(
    entityName: string,
    fieldName: string,
    fieldValue: string | number,
  ): HttpException {
    throw new NotFoundException(
      `${entityName} with ${fieldName}: ${fieldValue} is removed`,
    );
  }

  resultAffected(
    entityName: string,
    fieldName: string,
    fieldValue: string | number,
  ): HttpException {
    throw new NotFoundException(
      `${entityName} with ${fieldName}: ${fieldValue} not found`,
    );
  }

  isExists(
    entityName: string,
    fieldName: string,
    fieldValue: string,
    searchResult: User | Chat,
  ): HttpException | void {
    if (searchResult) {
      throw new ConflictException(
        `${entityName} with ${fieldName}: ${fieldValue} is exist`,
      );
    }
  }

  noAccess(currentUserId: boolean, role?: string): HttpException | void {
    if (!currentUserId && role !== roleEnum.ADMIN) {
      throw new ForbiddenException(`User doesn't have access!`);
    }
  }

  emailNotConfirmed(status: string): HttpException | void {
    if (status !== statusEnum.CONFIRMED) {
      throw new ForbiddenException(
        `You will need to confirm your current mail first`,
      );
    }
  }

  emailNotCorrect(): HttpException {
    throw new BadRequestException(`Email is not correct`);
  }

  specifiedEmailExists(): HttpException {
    throw new BadRequestException(`The specified email already exists`);
  }

  badAuth(): HttpException {
    throw new UnauthorizedException('Incorrect token');
  }

  nonePassword(): HttpException {
    throw new UnauthorizedException(
      'Password not set, try logging in using social network',
    );
  }

  incorrectEventOwner(): HttpException {
    throw new ForbiddenException('You are not the owner of the event');
  }

  incorrectChatId(chatId: number, eventId: number): HttpException {
    throw new ForbiddenException(
      `Chat with id: ${chatId} not applicable to event with id: ${eventId}`,
    );
  }

  incorrectPassword() {
    throw new UnauthorizedException('Incorrect password');
  }

  socialUnauthorized(socialKey: string): HttpException | void {
    if (!socialKey) {
      throw new UnauthorizedException(`An authorization error has occurred!`);
    }
  }

  serverError(error: string): HttpException {
    throw new InternalServerErrorException('Oops some went wrong', error);
  }

  subscriptionExists(): HttpException {
    throw new BadRequestException('User already subscribed to this event');
  }

  subscribeRequestNotConfirmed(): HttpException {
    throw new BadRequestException('Request sent but not confirmed');
  }

  userIsBlocked(fieldName: string): HttpException {
    throw new BadRequestException(`User is blocked to this ${fieldName}`);
  }

  userIsPermanentBlocked(): HttpException {
    throw new BadRequestException(
      'The user is permanent blocked because he has five blocks',
    );
  }

  subscriptionNotExists(): HttpException {
    throw new BadRequestException('User dont subscribed to this event');
  }

  fileIsNotFound(imgName: string): HttpException {
    throw new NotFoundException(`Image with name ${imgName} is not found`);
  }

  failedLoadFile(error: string): HttpException {
    throw new BadRequestException({
      message: 'Failed to load file',
      error,
    });
  }

  failedDeleteFile(error: string): HttpException {
    throw new BadRequestException({
      message: 'Failed to delete file',
      error,
    });
  }

  subscribedToUser(): HttpException {
    throw new BadRequestException('User already subscribed to this user');
  }

  requestToUserNotFound(): HttpException {
    throw new NotFoundException('Friend request not found');
  }

  passwordMismatch(
    password: string,
    confirmedPassword: string,
  ): HttpException | void {
    if (password !== confirmedPassword) {
      throw new BadRequestException(`Password does not match`);
    }
  }

  cannotToSetRating(date?: Date): HttpException {
    if (date) {
      throw new BadRequestException(
        'You cannot set a rating later than seven days after the event',
      );
    }

    throw new BadRequestException('Unable to set a rating');
  }

  cannotToSetComment(): HttpException {
    throw new BadRequestException('Unable to set a comment');
  }

  cannotToDeleteComment(): HttpException {
    throw new BadRequestException('You cannot delete a comment');
  }
}
