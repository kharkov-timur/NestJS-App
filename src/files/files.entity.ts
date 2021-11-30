import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseColumn } from '@shared/base-column.entity';
import { Event } from '../events/event.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'files' })
export class File extends BaseColumn {
  @Column()
  public name: string;

  @ManyToOne(() => Event, (event) => event.files, {
    onDelete: 'CASCADE',
  })
  public event: Event;

  @ManyToOne(() => User, (user) => user.files, {
    onDelete: 'CASCADE',
  })
  public user: User;
}
