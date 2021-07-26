import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '@shared/base.entity';

import { statusEnum } from './enums/status.enum';
import { Token } from '../token/token.entity';
import { roleEnum } from './enums/role.enum';

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

  @Column({
    type: 'enum',
    enum: roleEnum,
    default: roleEnum.USER,
  })
  public role: roleEnum;

  @ManyToOne(() => Token, (token) => token.user)
  public token: Token;
}
