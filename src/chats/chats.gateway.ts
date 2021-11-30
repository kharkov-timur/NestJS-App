import { UseGuards, Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GetUser } from '../components/decorators/get-user.decorator';
import { WsJwtAuthGuard } from '../auth/jwt/jwt-ws-auth.guard';
import { AuthService } from '../auth/auth.service';
import { ISocketWithUser } from './interfaces/gateway.interface';
import { MessagesService } from 'src/messages/messages.service';
import { ChatsService } from './chats.service';
import { MessageDto } from 'src/messages/dto/message.dto';
import { IChat } from './interfaces/chat.interface';
import { IUser } from 'src/user/interfaces/user.intarface';

@UseGuards(WsJwtAuthGuard)
@WebSocketGateway()
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  constructor(
    @Inject(AuthService)
    private authService: AuthService,
    @Inject(MessagesService)
    private messageService: MessagesService,
    @Inject(ChatsService)
    private chatsService: ChatsService,
  ) {}

  @SubscribeMessage('message')
  async handleEvent(
    @MessageBody() messageDto: MessageDto,
    @GetUser() userInfo: IUser,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<string>> {
    console.log(
      '🚀 ~ file: chats.gateway.ts ~ line 45 ~ ChatsGateway ~ content',
      messageDto,
    );

    const chatChannel = client.handshake.query.chatId as string;

    switch (messageDto.type) {
      case 'message':
        const message = await this.messageService.createMessage(
          userInfo,
          Number(chatChannel),
          messageDto,
        );
        this.server.emit(chatChannel, message);

      case 'update-message':
        const updatedMessage = await this.messageService.updateMessage(
          userInfo,
          Number(chatChannel),
          messageDto,
        );
        this.server.emit(chatChannel, updatedMessage);

      case 'delete-message':
        const deletedMessage = await this.messageService.deleteMessage(
          userInfo,
          Number(chatChannel),
          messageDto,
        );
        this.server.emit(chatChannel, deletedMessage);

      case 'upload-file':
        console.log(messageDto);
    }

    return;
  }

  async handleConnection(client: ISocketWithUser): Promise<void> {
    const user = await this.authService.decodeTokenForWs(
      client.handshake?.headers?.authorization,
    );

    const {
      page = 1,
      limit = 5,
      chatId: chatChannel,
    } = client.handshake?.query as {
      page: string;
      limit: string;
      chatId: string;
    };

    client.user = user;
    client.paginationOptions = { page, limit };

    if (!chatChannel) {
      client.disconnect();
      throw new WsException('Need chatid to join chat');
    }

    const chat = await this.chatsService.checkToAccessInChat(
      user.id,
      Number(chatChannel),
      client,
    );

    if (!chat) {
      client.disconnect();
    }

    this.server.emit(
      chatChannel,
      `${user.name} ${user.surname} connected to chat`,
    );

    this.handleSendOldMessages(chat, client);

    this.logger.log(`${user.name} ${user.surname} connected to chat`);
  }

  handleDisconnect(client: ISocketWithUser): void {
    const chatChannel = client.handshake?.query?.chatId as string;

    this.logger.log(
      `${client.user?.name} ${client.user?.surname} disconnected from the chat`,
    );

    this.server.emit(
      chatChannel,
      `${client.user?.name} ${client.user?.surname} disconnected from the chat`,
    );
  }

  async handleSendOldMessages(
    chat: IChat,
    client: ISocketWithUser,
  ): Promise<void> {
    const chatMessages = await this.messageService.getAllMessages(
      chat.id,
      client.paginationOptions,
    );

    chatMessages.items.forEach((el) => client.emit(chat.id.toString(), el));
    return;
  }

  async handleSendAllUsers() {}
}
