import { User } from '../user/user.entity';
// import { Role } from '../user/role/role.entity';
import { statusEnum } from '../user/enums/status.enum';

export interface IAuthResponse {
  token: string;
  user: User;
}

export interface ICutUser {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  status: statusEnum;
  // role: Role;
  avatar: File;
}

export interface ICutUserRegisterResponse {
  token: string;
  user: ICutUser;
}
