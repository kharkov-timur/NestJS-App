import { User } from '../user.entity';

export class PaginatedUsers {
  data: User[];
  count: number;
  totalPages: number;
}
