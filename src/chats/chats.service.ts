import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { EventsService } from 'src/events/events.service';
import { IEvent } from 'src/events/interfaces/event.interface';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { CustomValidation } from 'src/utils/custom-validation';
import { CustomWsValidation } from 'src/utils/custom-ws-validation';
import { IResponseService, ResponseService } from 'src/utils/response-service';
import { Repository } from 'typeorm';
import { Chat } from './chats.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat-dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    private userService: UserService,
    @Inject(forwardRef(() => EventsService))
    private eventService: EventsService,
  ) {}

  async findChat(chatId: number): Promise<Chat> {
    return this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['messages', 'event'],
    });
  }

  async findChatWithUserAndEvent(
    userId: number,
    eventId: number,
  ): Promise<Chat> {
    return this.chatRepository.findOne({
      where: { chatOwner: userId, event: eventId },
    });
  }

  async saveChat(chat: Chat): Promise<Chat> {
    return this.chatRepository.save(chat);
  }

  async createChat(
    userInfo: User,
    eventId: number,
    createChatDto: CreateChatDto,
  ): Promise<Chat> {
    const event = await this.eventService.checkForOwner(userInfo.id, eventId);

    const chat = await this.chatRepository.save(createChatDto);
    const chatWithRelations = await this.chatRepository.findOne(chat.id, {
      relations: ['users', 'chatOwner', 'event'],
    });

    const user = await this.userService.findUser(userInfo.id);

    if (!user) {
      new CustomValidation().notFound('User', 'id', userInfo.id, user);
    }

    chatWithRelations.event = event;
    chatWithRelations.users = [...chatWithRelations.users, user];
    chatWithRelations.chatOwner = user;
    user.chatsOwned = [...user.chatsOwned, chat];
    user.chats = [...user.chats, chat];

    await this.userService.saveUser(user);

    await this.addSubscribeOnChat(user.id, chat.id);

    return this.chatRepository.save(chatWithRelations);
  }

  async updateChat(
    userInfo: User,
    chatId: number,
    updateChatDto: UpdateChatDto,
  ): Promise<Chat> {
    const chat = await this.chatRepository.findOne(chatId);

    if (!chat) {
      new CustomValidation().notFound('Chat', 'id', chatId, chat);
    }

    await this.eventService.checkForOwner(userInfo.id, chat.event?.id);

    return this.chatRepository.save({ ...chat, ...updateChatDto });
  }

  async deleteChat(
    userId: number,
    eventId: number,
    chatId: number,
  ): Promise<IResponseService> {
    const event = await this.eventService.checkForOwner(userId, eventId);

    if (event.chat?.id !== chatId) {
      new CustomValidation().incorrectChatId(chatId, eventId);
    }

    event.chat = null;
    await this.eventService.saveEvent(event);

    const user = await this.userService.findUser(userId);
    user.chats = user.chats.filter((el) => el.id !== chatId);

    await this.userService.saveUser(user);

    const chat = await this.chatRepository.findOne(chatId);

    if (!chat) {
      new CustomValidation().notFound('Chat', 'id', chatId, chat);
    }

    await this.chatRepository.remove(chat);

    return new ResponseService().deleteChatSuccess(chatId);
  }

  public async checkToAccessInChat(
    userId: number,
    chatId: number,
    client: Socket,
  ): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['users'],
    });
    console.log(
      '🚀 ~ file: chats.service.ts ~ line 123 ~ ChatsService ~ chat',
      chat,
    );

    if (!chat) {
      client.disconnect();
      new CustomWsValidation().notFound('Chat', 'id', chatId);
    }

    const userInChat = chat.users.some((el) => el.id === userId);

    if (!userInChat) {
      client.disconnect();
      new CustomWsValidation().noAccessToChat('Chat', 'id', chatId);
    }

    return chat;
  }

  async addSubscribeOnChat(userId: number, chatId: number) {
    const user = await this.userService.findUser(userId);
    const chat = await this.chatRepository.findOne(chatId, {
      relations: ['users'],
    });

    user.chats = [...user.chats, chat];
    chat.users = [...chat.users, user];

    await this.userService.saveUser(user);
    return this.chatRepository.save(chat);
  }

  async removeSubscribeOnChat(user: User, event: IEvent) {
    const eventChatId = event.chat?.id;

    if (eventChatId) {
      const chat = await this.chatRepository.findOne(eventChatId, {
        relations: ['users'],
      });

      user.chats = user.chats.filter((chat) => chat.id !== eventChatId);
      chat.users = chat.users.filter((user) => user.id !== user.id);

      await this.userService.saveUser(user);
      return this.chatRepository.save(chat);
    }

    return;
  }
}
