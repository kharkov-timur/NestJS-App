import { hashSync } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';
import { Repository } from 'typeorm';
import { Role } from './role/role.entity';
import { BaseUserDto } from './dto/base-user.dto';
import { CustomValidation } from '../utils/custom-validation';
import { PaginationDto } from '@shared/pagination.dto';
import { PaginatedUsers } from './dto/paginatedUsers.dto';
import { getTotalPages, takeSkipCalculator } from '../utils/get-total-pages';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async createUser(body: BaseUserDto): Promise<User> {
    body.password = hashSync(body.password, JSON.parse(process.env.SALT));
    body.confirmPassword = hashSync(
      body.confirmPassword,
      JSON.parse(process.env.SALT),
    );
    return await this.userRepository.save(body);
  }

  async getProfile(userId: number): Promise<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.createdAt',
        'user.updatedAt',
        'user.firstName',
        'user.lastName',
        'user.phoneNumber',
        'user.email',
        'user.dateOfBirth',
        'user.googleId',
        'user.facebookId',
        'user.role',
      ])
      .where({ id: userId })
      .leftJoin('user.avatar', 'avatar')
      .addSelect('avatar.name')
      .getOne();
  }

  async findUser(currentUser: User, id: number): Promise<User> {
    const user = await this.userRepository.findOne(id, { relations: ['role'] });
    new CustomValidation().notFound('Користувача', 'ID', id, user);

    const theCurrentUser = currentUser.id === id;
    new CustomValidation().noAccess(theCurrentUser);

    return user;
  }

  async getAllUsers(paginationDto: PaginationDto): Promise<PaginatedUsers> {
    const { page, limit } = paginationDto;
    const { skip } = takeSkipCalculator(limit, page);

    const [data, count]: [User[], number] = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.role', 'role')
      .take(limit)
      .skip(skip)
      .getManyAndCount();
    const totalPages = getTotalPages(count, limit, page);

    return { data, count, totalPages };
  }
}
