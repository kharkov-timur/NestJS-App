import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from '@shared/base.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'token' })
export class Token extends BaseEntity {
  @Column({
    nullable: true,
  })
  public token: string;

  @Column({
    nullable: true,
  })
  public userId: number;

  @Column({
    nullable: true,
  })
  public expireAt: Date;

  @ManyToOne(() => User, (user) => user.token)
  user: User;
}
