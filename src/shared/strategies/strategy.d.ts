import { User } from '../../user/user.entity';

export interface IUserValidationStrategy {
  validate: (user: User) => void;
}
