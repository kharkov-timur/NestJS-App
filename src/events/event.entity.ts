import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { RatingUser } from '../ratings/rating-user/rating-user.entity';
import { RatingEvent } from '../ratings/rating-event/rating-event.entity';
import { BaseColumn } from '@shared/base-column.entity';
import { Chat } from '../chats/chats.entity';
import { File } from '../files/files.entity';
import { User } from '../user/user.entity';
import { EventsSubscribe } from './events-subscribe/events-subscribe.entity';
import { EventComments } from '../comments/event-comments/event-comments.entity';

@Entity({ name: 'events' })
export class Event extends BaseColumn {
  @Column()
  public name: string;

  @Column()
  public type: string;

  @Column({ type: 'timestamptz' })
  public startDate: Date;

  @Column({ type: 'timestamptz' })
  public endDate: Date;

  @Column({ type: 'timestamptz' })
  public time: Date;

  @Column({
    default: 'Any',
  })
  public language: string;

  @Column()
  public address: string;

  @Column()
  public location: string;

  @Column({ nullable: true })
  public places: number;

  @Column({ default: 1 })
  public placesLeft: number;

  @Column({ nullable: true })
  public description: string;

  @Column({ type: 'numeric', precision: 10, scale: 1, default: 0 })
  public avgRating: string;

  @Column({ default: true })
  public joinOnConfirmation: boolean;

  @ManyToOne(() => User, (user) => user.eventsOwned)
  public userOwner: User;

  @ManyToMany(() => User, (user) => user.events)
  public users: User[];

  @OneToMany(() => RatingEvent, (ratings) => ratings.event)
  eventRating: RatingEvent;

  @OneToMany(() => RatingUser, (ratings) => ratings.sendingUser)
  userRating: RatingUser;

  @OneToMany(() => File, (files) => files.event)
  public files: File[];

  @OneToOne(() => File, (files) => files.event, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  public mainImg: File;

  @OneToOne(() => Chat, (chat) => chat.event)
  public chat: Chat;

  @OneToMany(
    () => EventsSubscribe,
    (eventsSubscriber) => eventsSubscriber.event,
  )
  public subscribers: EventsSubscribe[];

  @OneToMany(() => EventComments, (comments) => comments.event)
  public eventComments: EventComments[];
}
