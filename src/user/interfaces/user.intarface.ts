import { roleEnum } from '../enums/role.enum';
import { statusEnum } from '../enums/status.enum';
import { User } from '../user.entity';

export interface IUser {
  id?: number;
  name: string;
  surname: string;
  phoneNumber: string;
  email: string;
  hobbies: string[];
  password?: string;
  role?: roleEnum;
  status?: statusEnum;
  twitterId?: string;
  facebookId?: string;
  googleId?: string;
}

export interface IAuthResponse {
  token: string;
  user: User;
}

export interface ICheckStatusAndUserFound {
  user: User;
  userId?: number;
  email?: string;
  phoneNumber?: string;
}
