import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Like, Not, Repository } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import * as fs from 'fs';

import { User } from '../user/user.entity';
import { CustomValidation } from '../utils/custom-validation';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './event.entity';
import { IResponseService, ResponseService } from '../utils/response-service';
import { UpdateEventDto } from './dto/update-event.dto';
import { UserService } from '../user/user.service';
import { ChatsService } from '../chats/chats.service';
import { IFile } from '../files/interfaces/files.interface';
import { File } from '../files/files.entity';
import { ImageUtilsService } from '../files/image/image-utils.service';
import { FilesService } from '../files/files.service';
import { ChangeMainImgDto } from './dto/change-main-img.dto';
import { UploadImageDto } from './dto/upload-image.dto';
import { IEvent } from './interfaces/event.interface';
import { statusEnum } from '../user/enums/status.enum';
import { Monitor } from './monitor/monitor.entity';
import { IPushMessage } from '../push-notification/device/interfaces/push-message.interface';
import { CheckRadiusService } from '../check-radius/check-radius.service';
import { IDeviceForSendMessage } from '../push-notification/device/interfaces/device.interface';
import { NotificationService } from '../push-notification/notification/notification.service';
import { UsersEvents } from '../users-events/users-events.entity';
import { TODAY } from '../utils/work-with-time';
import { EventsSubscribeService } from './events-subscribe/events-subscribe.service';
import { EventsSubscribe } from './events-subscribe/events-subscribe.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Monitor)
    private monitorRepository: Repository<Monitor>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(UsersEvents)
    private usersEventsRepository: Repository<UsersEvents>,
    private userService: UserService,
    @Inject(forwardRef(() => ChatsService))
    private chatsService: ChatsService,
    private imageUtilsService: ImageUtilsService,
    private filesService: FilesService,
    private notificationService: NotificationService,
    private eventsSubscribeService: EventsSubscribeService,
  ) {}

  async checkSubscribeStatus(
    userId: number,
    eventId: number,
    entityName?: string,
  ): Promise<EventsSubscribe> {
    const isSubscribed = await this.eventsSubscribeService.findEventSubscribe(
      userId,
      eventId,
    );

    if (
      (!isSubscribed && entityName === 'rating') ||
      (!isSubscribed && entityName === 'comment')
    ) {
      new CustomValidation().subscriptionNotExists();
    }

    if (isSubscribed && isSubscribed.status === statusEnum.BLOCKED) {
      new CustomValidation().userIsBlocked('event');
    }

    if (isSubscribed && isSubscribed.status === statusEnum.PENDING) {
      new CustomValidation().subscribeRequestNotConfirmed();
    }

    return isSubscribed;
  }

  public async getAllEventsWithPaginate(
    options: IPaginationOptions,
  ): Promise<Pagination<Event>> {
    const events = this.eventRepository.createQueryBuilder('events');

    await events
      .leftJoinAndSelect('events.files', 'files as ef')
      .leftJoinAndSelect('events.userOwner', 'userOwner')
      .leftJoinAndSelect('userOwner.files', 'files as uof')
      .where('events.endDate >= :today', { today: TODAY })
      .leftJoinAndSelect('events.subscribers', 'subscribers')
      .andWhere('subscribers.status = :status', {
        status: statusEnum.CONFIRMED,
      })
      .leftJoinAndSelect('subscribers.subscriber', 'subscriber')
      .leftJoinAndSelect('subscriber.files', 'files as sf')
      .getMany();

    return paginate<Event>(events, options);
  }

  public async saveEvent(event: IEvent): Promise<Event> {
    return this.eventRepository.save(event);
  }

  public checkEventFound(eventId: number, event: Event): Event {
    if (!event) {
      new CustomValidation().notFound('Event', 'id', eventId, event);
    }

    return event;
  }

  public async getEventById(eventId: number): Promise<Event> {
    const event = await this.eventRepository
      .createQueryBuilder('events')
      .leftJoinAndSelect('events.mainImg', 'mainImg as emi')
      .leftJoinAndSelect('events.files', 'files as ef')
      .leftJoinAndSelect('events.userOwner', 'userOwner')
      .leftJoinAndSelect('userOwner.mainImg', 'mainImg as umi')
      .leftJoinAndSelect('userOwner.files', 'files as uof')
      .where('events.id = :id', { id: eventId })
      .leftJoinAndSelect('events.subscribers', 'subscribers')
      .leftJoinAndSelect('subscribers.subscriber', 'subscriber')
      .andWhere('subscribers.status != :status', {
        status: statusEnum.BLOCKED,
      })
      .leftJoinAndSelect('subscriber.mainImg', 'mainImg as smi')
      .leftJoinAndSelect('subscriber.files', 'files as uf')
      .getOne();

    this.checkEventFound(eventId, event);

    if (event.userOwner.status === statusEnum.REMOVED) {
      delete event.userOwner;
      return event;
    }

    return event;
  }

  public async pastEvents(
    options: IPaginationOptions,
  ): Promise<Pagination<Event>> {
    return paginate<Event>(this.eventRepository, options, {
      where: { endDate: LessThan(TODAY) },
      order: { endDate: 'ASC' },
      relations: [
        'mainImg',
        'files',
        'userOwner',
        'userOwner.files',
        'subscribers',
        'subscribers.subscriber',
        'subscribers.subscriber.files',
      ],
    });
  }

  public async createNewEvent(
    reqUserId: number,
    createEventDto: CreateEventDto,
  ): Promise<Event> {
    const { places, createChat, type, location } = createEventDto;
    const event = this.eventRepository.create(createEventDto);
    const user = await this.userService.findUser(reqUserId);
    const isOwner = true;

    event.placesLeft = places;
    event.userOwner = user;
    user.events = [...user.events, event];

    await this.eventRepository.save(event);

    if (createChat) {
      const chat = await this.chatsService.createChat(user, event.id, {
        name: event.name,
        description: event.description,
      });

      event.chat = chat;
      await this.eventRepository.save(event);
      await this.userService.saveUser(user);
      await this.chatsService.addSubscribeOnChat(reqUserId, chat.id);
    }

    await this.eventsSubscribeService.addSubscribeOnEvent(
      reqUserId,
      event.id,
      isOwner,
    );

    const checkMonitors = await this.monitorRepository
      .createQueryBuilder('monitor')
      .where('monitor.types @> ARRAY[:...types]', {
        types: [type],
      })
      .getMany();

    if (checkMonitors.length) {
      await this.sendPushMessage(type, location);
    }

    return this.eventRepository.findOne(event.id, {
      relations: [
        'mainImg',
        'files',
        'userOwner',
        'userOwner.mainImg',
        'userOwner.files',
        'chat',
      ],
    });
  }

  async sendPushMessage(
    eventType: string,
    eventLocation: string,
  ): Promise<IResponseService | void> {
    const monitors: Monitor[] = await this.monitorRepository
      .createQueryBuilder('monitor')
      .where('monitor.types @> ARRAY[:...types]', {
        types: [eventType],
      })
      .leftJoinAndSelect('monitor.userOwner', 'userOwner')
      .leftJoinAndSelect('monitor.deviceForMonitor', 'deviceForMonitor')
      .getMany();

    const devicesForSendMessage: IDeviceForSendMessage[] = [];

    monitors.forEach((monitor) => {
      const { searchRadius, deviceForMonitor } = monitor;

      return deviceForMonitor.forEach((device) => {
        const { deviceToken, location, deviceId } = device;

        const customDevice = {
          deviceToken: deviceToken,
          location: location,
          deviceId: deviceId,
          radius: searchRadius,
        };

        return devicesForSendMessage.push(customDevice);
      });
    });

    if (devicesForSendMessage.length) {
      const devicesWithCheckRadius =
        new CheckRadiusService().checkRadiusForDevices(
          devicesForSendMessage,
          eventLocation,
        );

      const message: IPushMessage = {
        notification: {
          tag: 'New Event',
          body: 'You have a new event',
        },
      };

      return this.notificationService.sendPushMessage(
        devicesWithCheckRadius,
        message,
      );
    }
  }

  async updateEvent(
    userInfo: User,
    eventId: number,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.checkForOwner(userInfo.id, eventId);
    const { places, placesLeft } = event;

    const updatedEvent = {
      placesLeft,
      ...updateEventDto,
    };

    if (updateEventDto.places) {
      const oldPlacesLeft = places - placesLeft;
      updatedEvent.placesLeft = updatedEvent.places - oldPlacesLeft;
    }

    await this.eventRepository.update(event.id, {
      ...updatedEvent,
    });

    return this.getEventById(eventId);
  }

  async deleteEvent(
    userId: number,
    eventId: number,
  ): Promise<IResponseService | HttpException> {
    const event = await this.checkForOwner(userId, eventId);
    const { files } = event;

    if (files.length) {
      const filesNames = files.map((file) => file.name);

      process.env.NODE_ENV !== 'local'
        ? await this.imageUtilsService.deleteFromGoogleStorage(filesNames)
        : await this.imageUtilsService.imagesRemover(filesNames);
    }

    await this.chatsService.deleteChat(userId, event.id, event.chat?.id);
    await this.usersEventsRepository.delete({ eventId });
    await this.eventRepository.delete(eventId);

    return new ResponseService().deleteEventSuccess(eventId);
  }

  async checkForOwner(userId: number, eventId: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['files', 'userOwner', 'chat'],
    });

    this.checkEventFound(eventId, event);

    if (event.userOwner?.id !== userId) {
      new CustomValidation().incorrectEventOwner();
    }

    return event;
  }

  async uploadImage(
    reqUserId: number,
    file: IFile,
    { eventId }: UploadImageDto,
  ): Promise<IResponseService> {
    const relatedEvent = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['mainImg'],
    });

    if (!relatedEvent) {
      await fs.promises.unlink(file.path);
      this.checkEventFound(eventId, relatedEvent);
    }

    await this.checkForOwner(reqUserId, eventId);

    const { cropped, original } =
      await this.imageUtilsService.fileNameGenerator({
        file,
        relatedEvent,
        fileRepository: this.fileRepository,
      });

    if (!relatedEvent.mainImg) {
      await this.eventRepository.update(eventId, { mainImg: original });
    }

    const fileNames: string[] = [original.name];
    fileNames.push(cropped.name);

    await this.imageUtilsService.uploadToGoogleStorage(fileNames);

    return new ResponseService().uploadImageSuccess(original.name);
  }

  async uploadMultipleImage(
    reqUserId: number,
    files: IFile[],
    { eventId }: UploadImageDto,
  ): Promise<IResponseService> {
    const relatedEvent = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['mainImg'],
    });

    if (!relatedEvent) {
      files.forEach((file: IFile) => {
        fs.promises.unlink(file.path);
      });
      this.checkEventFound(eventId, relatedEvent);
    }

    await this.checkForOwner(reqUserId, eventId);
    await this.imageUtilsService.imageProcessor(files).catch(console.error);

    const mappedFileProps = [];

    files.forEach((file: IFile) => {
      const { fileName, isPng, isHeic } =
        this.imageUtilsService.getFileName(file);

      mappedFileProps.push({
        name: isPng || isHeic ? `${fileName}.jpeg` : file.filename,
        event: relatedEvent,
      });

      mappedFileProps.push({
        name:
          isPng || isHeic
            ? `cropped-${fileName}.jpeg`
            : `cropped-${file.filename}`,
        event: relatedEvent,
      });
    });

    await this.fileRepository.save(mappedFileProps);

    if (!relatedEvent.mainImg) {
      await this.eventRepository.update(eventId, {
        mainImg: mappedFileProps[0],
      });
    }

    const fileNames = mappedFileProps.map((item) => item.name);

    await this.imageUtilsService.uploadToGoogleStorage(fileNames);

    return new ResponseService().uploadImageSuccess(fileNames.join(', '));
  }

  async changePreviewImage({
    eventId,
    imgName,
  }: ChangeMainImgDto): Promise<Event> {
    const relatedImage = await this.fileRepository.findOne({
      where: { name: imgName, event: eventId },
    });

    if (!relatedImage) {
      new CustomValidation().notFound('Image', 'name:', imgName, relatedImage);
    }

    const result = await this.eventRepository.update(eventId, {
      mainImg: relatedImage,
    });

    if (!result.affected) {
      new CustomValidation().resultAffected('Event', 'id', eventId);
    }

    return this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['mainImg', 'files'],
    });
  }

  async deleteImageFile(
    eventId: number,
    imgName: string,
  ): Promise<IResponseService> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['mainImg'],
    });

    const file = await this.fileRepository.findOne({
      where: { id: event.mainImg.id },
    });

    const imgNames = [];
    imgNames.push(imgName, `cropped-${imgName}`);

    if (file.name === imgName) {
      await this.filesService.deleteImage(imgNames);

      const mainImages = await this.fileRepository.find({
        where: { event: eventId, name: Not(Like('%cropped%')) },
        order: { id: 'ASC' },
      });

      await this.eventRepository.update(eventId, { mainImg: mainImages[0] });

      return new ResponseService().deleteImageSuccess(imgNames.join(', '));
    }

    return this.filesService.deleteImage(imgNames);
  }
}
