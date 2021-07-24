import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from './user.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  public id: number;

  @Column({
    name: 'first_name',
    nullable: false,
  })
  @ApiProperty()
  public firstName: string;

  @Column({
    name: 'last_name',
    nullable: false,
  })
  @ApiProperty()
  public lastName: string;

  @Column({
    name: 'user_name',
    nullable: false,
  })
  @ApiProperty()
  public userName: string;

  @Column({
    name: 'email',
    nullable: false,
    unique: true,
  })
  @ApiProperty()
  public email: string;

  @Column({ name: 'password', nullable: false })
  @ApiProperty()
  public password: string;

  @Column({
    name: 'role',
    enum: UserRoleEnum,
    insert: true,
    default: UserRoleEnum.user,
  })
  @ApiProperty({
    enum: UserRoleEnum,
  })
  public role: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  @ApiProperty()
  public createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  @ApiProperty()
  public updatedAt: Date;
}
