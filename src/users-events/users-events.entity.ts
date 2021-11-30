import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users_events' })
export class UsersEvents {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  eventId: number;
}
