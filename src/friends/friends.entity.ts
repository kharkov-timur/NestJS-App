import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseColumn } from '@shared/base-column.entity';
import { User } from '../user/user.entity';
import { statusEnum } from '../user/enums/status.enum';

@Entity({ name: 'friends' })
export class Friends extends BaseColumn {
  @ManyToOne(() => User, (user) => user.followers, {
    onDelete: 'CASCADE',
  })
  public follower: User;

  @ManyToOne(() => User, (user) => user.following, {
    onDelete: 'CASCADE',
  })
  public followee: User;

  @Column({
    type: 'enum',
    enum: statusEnum,
    nullable: true,
  })
  public status: statusEnum;
}
