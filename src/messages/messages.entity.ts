import { ApiProperty } from '@nestjs/swagger';
import { BaseColumn } from '@shared/base-column.entity';
import { Chat } from 'src/chats/chats.entity';
import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'messages' })
export class Message extends BaseColumn {
  @ApiProperty()
  @Column()
  public content: string;

  @ApiProperty()
  @Column()
  public userName: string;

  @ApiProperty()
  @Column()
  public userId: number;

  @ApiProperty()
  @Column()
  public chatId: number;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  public chat: Chat;

  @ManyToOne(() => User, (user) => user.messages)
  public user: User;
}
