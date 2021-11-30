import { statusEnum } from '../../user/enums/status.enum';
import { User } from '../../user/user.entity';

export interface IFriend {
  status: statusEnum;
  follower: User;
}
