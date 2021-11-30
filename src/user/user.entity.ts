import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { statusEnum } from './enums/status.enum';
import { Token } from '../token/token.entity';
import { Event } from '../events/event.entity';
import { roleEnum } from './enums/role.enum';
import { RatingEvent } from '../ratings/rating-event/rating-event.entity';
import { RatingUser } from '../ratings/rating-user/rating-user.entity';
import { BaseColumn } from '@shared/base-column.entity';
import { Chat } from '../chats/chats.entity';
import { Message } from '../messages/messages.entity';
import { File } from '../files/files.entity';
import { Friends } from '../friends/friends.entity';
import { Monitor } from '../events/monitor/monitor.entity';
import { Device } from '../push-notification/device/device.entity';
import { EventsSubscribe } from '../events/events-subscribe/events-subscribe.entity';
import { EventComments } from '../comments/event-comments/event-comments.entity';

@Entity({ name: 'users' })
export class User extends BaseColumn {
  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public surname: string;

  @Column({ nullable: true })
  public phoneNumber: string;

  @Column({ unique: true, nullable: true })
  public email: string;

  @Column({ nullable: true, select: false })
  public password: string;

  @Column({ type: 'text', array: true, nullable: true })
  public hobbies: string[];

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  facebookId: string;

  @Column({ nullable: true })
  twitterId: string;

  @Column({
    type: 'enum',
    enum: statusEnum,
    default: statusEnum.PENDING,
  })
  public status: statusEnum;

  @Column({
    type: 'enum',
    enum: roleEnum,
    default: roleEnum.USER,
  })
  public role: roleEnum;

  @Column()
  public firstLogin: boolean;

  @OneToMany(() => Token, (token) => token.user)
  public token: Token;

  @OneToMany(() => Event, (event) => event.userOwner)
  public eventsOwned: Event[];

  @OneToOne(() => Monitor, (monitor) => monitor.userOwner)
  public monitorOwned: Monitor;

  @OneToMany(() => Device, (devices) => devices.userOwner)
  public deviceOwned: Device;

  @Column({ type: 'numeric', precision: 10, scale: 1, default: 0 })
  public avgRating: string;

  @ManyToMany(() => Event, (event) => event.users)
  @JoinTable({
    name: 'users_events',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'eventId' },
  })
  public events: Event[];

  @OneToMany(() => RatingEvent, (ratings) => ratings.user)
  public eventRating: RatingEvent;

  @OneToMany(() => RatingUser, (ratings) => ratings.sendingUser)
  public userRating: RatingUser;

  @OneToMany(() => File, (files) => files.user)
  public files: File[];

  @OneToOne(() => File, (avatar) => avatar.user, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  public mainImg: File;

  @OneToMany(() => Chat, (chat) => chat.chatOwner)
  public chatsOwned: Chat[];

  @ManyToMany(() => Chat, (chat) => chat.users)
  @JoinTable({
    name: 'users_chats',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'chatId' },
  })
  public chats: Chat[];

  @OneToMany(() => Message, (message) => message.user)
  public messages: Message[];

  @OneToMany(() => Friends, (friends) => friends.follower)
  public followers: Friends[];

  @OneToMany(() => Friends, (friend) => friend.followee)
  public following: Friends[];

  @OneToMany(
    () => EventsSubscribe,
    (eventsSubscriber) => eventsSubscriber.subscriber,
  )
  public eventSubscriber: EventsSubscribe[];

  @OneToMany(
    () => EventsSubscribe,
    (eventsSubscriber) => eventsSubscriber.receiving,
  )
  public eventReceiving: EventsSubscribe[];

  @OneToMany(() => EventComments, (comments) => comments.author)
  public eventComments: EventComments[];
}
