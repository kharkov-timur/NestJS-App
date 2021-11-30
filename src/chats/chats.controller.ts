import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { GetUser } from 'src/components/decorators/get-user.decorator';
import { User } from 'src/user/user.entity';
import { Chat } from './chats.entity';
import { ChatsService } from './chats.service';
import { UpdateChatDto } from './dto/update-chat-dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Chat')
@Controller('chats')
export class ChatsController {
  constructor(private chatsService: ChatsService) {}

  @Put('/update/:chatId')
  async updateChat(
    @GetUser() userInfo: User,
    @Param('chatId') chatId: number,
    @Body() updateChatDto: UpdateChatDto,
  ): Promise<Chat> {
    return await this.chatsService.updateChat(userInfo, chatId, updateChatDto);
  }
}
