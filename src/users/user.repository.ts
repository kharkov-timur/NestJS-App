import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async getUsers(search: string): Promise<User[]> {
    const query = this.createQueryBuilder('user');

    if (search) {
      query
        .where('last_name ILIKE :search', { search: `%${search}%` })
        .orWhere('first_name ILIKE :search', { search: `%${search}%` })
        .orWhere('user_name ILIKE :search', { search: `%${search}%` });
    }

    const users = await query.getMany();
    return users;
  }
}
