import { Chat } from '../../chats/chats.entity';
import { statusEnum } from '../../user/enums/status.enum';
import { User } from '../../user/user.entity';
import { Event } from '../event.entity';

export interface IEvent {
  id: number;
  name: string;
  type: string;
  startDate: Date;
  endDate: Date;
  time: Date;
  language: string;
  address: string;
  location: string;
  places: number;
  placesLeft: number;
  chat: Chat;
}

export interface IEventsSubscribe {
  subscriber: User;
  receiving: User;
  event: Event;
  status: statusEnum;
}
