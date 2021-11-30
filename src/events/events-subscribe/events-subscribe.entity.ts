import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseColumn } from '@shared/base-column.entity';
import { statusEnum } from '../../user/enums/status.enum';
import { User } from '../../user/user.entity';
import { Event } from '../event.entity';

@Entity({ name: 'events-subscribe' })
export class EventsSubscribe extends BaseColumn {
  @ManyToOne(() => User, (user) => user.eventSubscriber, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  public subscriber: User;

  @ManyToOne(() => User, (user) => user.eventReceiving, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  public receiving: User;

  @ManyToOne(() => Event, (event) => event.subscribers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  public event: Event;

  @Column({
    type: 'enum',
    enum: statusEnum,
  })
  public status: statusEnum;
}
