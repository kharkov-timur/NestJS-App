import { ApiProperty } from '@nestjs/swagger';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  public id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
