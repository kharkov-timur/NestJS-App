import { Column, Entity, ManyToOne } from 'typeorm';

import { User } from '../user/user.entity';
import { BaseColumn } from '@shared/base-column.entity';

@Entity({ name: 'token' })
export class Token extends BaseColumn {
  @Column()
  public token: string;

  @Column()
  public userId: number;

  @Column()
  public expireAt: Date;

  @ManyToOne(() => User, (user) => user.token, { onDelete: 'CASCADE' })
  public user: User;
}
