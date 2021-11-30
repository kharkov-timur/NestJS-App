import { Column, Entity, ManyToOne } from 'typeorm';

import { User } from '../../user/user.entity';
import { Event } from '../../events/event.entity';
import { BaseColumn } from '@shared/base-column.entity';

@Entity({ name: 'rating-event' })
export class RatingEvent extends BaseColumn {
  @Column()
  rating: number;

  @ManyToOne(() => Event, (event) => event.eventRating, {
    onDelete: 'CASCADE',
  })
  event: Event;

  @ManyToOne(() => User, (user) => user.eventRating, {
    onDelete: 'CASCADE',
  })
  user: User;
}
