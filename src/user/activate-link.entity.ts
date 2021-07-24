import { Column, Entity } from 'typeorm';

import { BaseEntity } from '@shared/base.entity';

@Entity({ name: 'activation-link' })
export class ActivateLink extends BaseEntity {
  @Column()
  public userId: number;

  @Column()
  public token: string;
}
