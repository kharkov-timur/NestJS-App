import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseColumn } from '@shared/base-column.entity';
import { User } from '../../user/user.entity';
import { Event } from '../../events/event.entity';

@Entity({ name: 'event-comments' })
export class EventComments extends BaseColumn {
  @Column()
  public text: string;

  @ManyToOne(() => User, (user) => user.eventComments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public author: User;

  @ManyToOne(() => Event, (event) => event.eventComments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public event: Event;
}
