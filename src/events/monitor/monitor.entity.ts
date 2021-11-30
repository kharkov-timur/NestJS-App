import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseColumn } from '@shared/base-column.entity';
import { User } from '../../user/user.entity';
import { Device } from '../../push-notification/device/device.entity';

@Entity({ name: 'monitor' })
export class Monitor extends BaseColumn {
  @Column()
  public searchRadius: number;

  @Column({ type: 'text', array: true })
  public types: string[];

  @OneToOne(() => User, (user) => user.monitorOwned)
  @JoinColumn()
  public userOwner: User;

  @OneToMany(() => Device, (device) => device.monitorForDevice, {
    nullable: true,
  })
  @JoinColumn()
  public deviceForMonitor: Device[];
}
