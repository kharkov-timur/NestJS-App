import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseColumn } from '@shared/base-column.entity';
import { User } from 'src/user/user.entity';
import { Event } from 'src/events/event.entity';
import { Message } from 'src/messages/messages.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Chat extends BaseColumn {
  @ApiProperty()
  @Column()
  public name: string;

  @ApiProperty()
  @Column({ nullable: true })
  public description: string;

  @ApiProperty()
  @Column({ default: true })
  public available: boolean;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.chatsOwned)
  @JoinColumn()
  public chatOwner: User;

  @ApiProperty({ type: () => User })
  @ManyToMany(() => User, (user) => user.chats)
  public users: User[];

  @ApiProperty({ type: () => Event })
  @OneToOne(() => Event, (event) => event.chat)
  @JoinColumn()
  public event: Event;

  @ApiProperty({ type: () => Message })
  @OneToMany(() => Message, (message) => message.chat)
  @JoinColumn()
  public messages: Message[];
}
