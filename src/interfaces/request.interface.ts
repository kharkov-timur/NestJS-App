import { Request } from '@nestjs/common';
import { User } from '../user/user.entity';

export interface IRequest extends Request {
  user: User;
  logout?: () => void;
}
