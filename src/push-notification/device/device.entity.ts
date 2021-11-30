import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseColumn } from '@shared/base-column.entity';
import { User } from '../../user/user.entity';
import { Monitor } from '../../events/monitor/monitor.entity';

@Entity({ name: 'devices' })
export class Device extends BaseColumn {
  @Column()
  public deviceId: string;

  @Column()
  public platform: string;

  @Column()
  public deviceToken: string;

  @Column({ default: null })
  public location: string;

  @ManyToOne(() => User, (user) => user.deviceOwned, { onDelete: 'CASCADE' })
  @JoinColumn()
  public userOwner: User;

  @ManyToOne(() => Monitor, (monitor) => monitor.deviceForMonitor, {
    nullable: true,
  })
  @JoinColumn()
  public monitorForDevice: User;
}
