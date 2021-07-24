import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from '@shared/base.entity';
import { Role } from './role/role.entity';
import { statusEnum } from './enums/status.enum';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({
    nullable: true,
  })
  public firstName: string;

  @Column({
    nullable: true,
  })
  public lastName: string;

  @Column({
    nullable: true,
  })
  public phoneNumber: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  public password: string;

  @Column({ nullable: true })
  public dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: statusEnum,
    default: statusEnum.PENDING,
  })
  public status: statusEnum;

  @ManyToOne(() => Role, (role) => role.users)
  public role: Role;
}
