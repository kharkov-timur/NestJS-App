import { Column, Entity, ManyToOne } from 'typeorm';

import { User } from '../../user/user.entity';
import { BaseColumn } from '@shared/base-column.entity';

@Entity({ name: 'rating-user' })
export class RatingUser extends BaseColumn {
  @Column()
  rating: number;

  @ManyToOne(() => User, (user) => user.userRating, {
    onDelete: 'CASCADE',
  })
  sendingUser: User;

  @ManyToOne(() => User, (user) => user.userRating, {
    onDelete: 'CASCADE',
  })
  receivingUser: User;
}
