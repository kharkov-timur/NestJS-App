import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { ChatsService } from 'src/chats/chats.service';
import { IUser } from 'src/user/interfaces/user.intarface';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { CustomValidation } from 'src/utils/custom-validation';
import { CustomWsValidation } from 'src/utils/custom-ws-validation';
import { Repository } from 'typeorm';
import { MessageDto } from './dto/message.dto';
import { Message } from './messages.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    private chatsService: ChatsService,
    private userService: UserService,
  ) {}

  async getAllMessages(
    chatId: number,
    options: IPaginationOptions,
  ): Promise<Pagination<Message>> {
    return paginate<Message>(this.messageRepository, options, {
      where: { chatId },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async createMessage(
    userInfo: IUser,
    chatId: number,
    createMessageDto: MessageDto,
  ): Promise<Message> {
    const chat = await this.chatsService.findChat(chatId);
    const user = await this.userService.findUser(userInfo.id);

    if (!chat) {
      new CustomWsValidation().notFound('Chat', 'id', chatId);
    }

    const message = this.messageRepository.create({
      ...createMessageDto,
      userName: `${user.name} ${user.surname}`,
    });

    message.chatId = chat.id;
    chat.messages = [...chat.messages, message];

    message.userId = user.id;
    user.messages = [...user.messages, message];

    await this.chatsService.saveChat(chat);
    return await this.messageRepository.save(message);
  }

  public async updateMessage(
    userInfo: IUser,
    chatId: number,
    messageDto: MessageDto,
  ) {
    const message = await this.messageRepository.findOne({
      where: { id: messageDto.id, chatId, userId: userInfo.id },
    });
    console.log(
      '🚀 ~ file: messages.service.ts ~ line 73 ~ MessagesService ~ message',
      message,
    );

    if (!message) {
      new CustomWsValidation().notFound('Message', 'id', messageDto.id);
    }

    await this.messageRepository.update(messageDto.id, {
      content: messageDto.content,
    });
  }

  public async deleteMessage(
    userInfo: IUser,
    chatId: number,
    messageDto: MessageDto,
  ) {
    const message = await this.messageRepository.findOne({
      where: { id: messageDto.id, chatId, userId: userInfo.id },
    });

    if (!message) {
      new CustomWsValidation().notFound('Message', 'id', messageDto.id);
    }

    return await this.messageRepository.remove(message);
  }
}
