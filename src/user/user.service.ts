import _ from 'lodash';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { BaseUserDto } from './dto/base-user.dto';
import { PaginationDto } from '@shared/pagination.dto';
import { PaginatedUsers } from './dto/paginatedUsers.dto';
import { getTotalPages, takeSkipCalculator } from '../utils/get-total-pages';
import { IUser } from './interfaces/user.intarface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(JSON.parse(process.env.SALT));
    return await bcrypt.hash(password, salt);
  }

  async createUser(body: BaseUserDto, role: string): Promise<User> {
    const password = await this.hashPassword(body.password);
    const confirmPassword = await this.hashPassword(body.confirmPassword);

    console.log(
      '🚀 ~ file: user.service.ts ~ line 26 ~ UserService ~ createUser ~ BaseUserDto',
      new BaseUserDto(),
    );
    const createdUser = _.assignIn(BaseUserDto, {
      password,
      confirmPassword,
      role,
    });

    return await this.userRepository.save(createdUser);
  }

  async findUser(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async updateUser(id: number, payload: Partial<User>) {
    return this.userRepository.update(id, { ...payload });
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
