import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { Socket } from 'socket.io';
import { User } from 'src/user/user.entity';

export interface ISocketWithUser extends Socket {
  user: User;
  paginationOptions: IPaginationOptions;
}
