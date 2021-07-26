import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { User } from './user.entity';
import { PaginationDto } from '@shared/pagination.dto';
import { PaginatedUsers } from './dto/paginatedUsers.dto';
import { getTotalPages, takeSkipCalculator } from '../utils/get-total-pages';
import { CreateUserDto } from './dto/create-user.dto';
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

  async createUser(CreateUserDto: CreateUserDto, role: string): Promise<IUser> {
    const password = await this.hashPassword(CreateUserDto.password);

    console.log(
      '🚀 ~ file: user.service.ts ~ line 26 ~ UserService ~ createUser ~ BaseUserDto',
      CreateUserDto,
    );
    const createdUser = _.assignIn(CreateUserDto, {
      password,
      role,
    });

    return await this.userRepository.save(createdUser);
  }

  async findUser(userId: number): Promise<User> {
    return await this.userRepository.findOne(userId);
  }

  async findUserByEmail(email: string): Promise<IUser> {
    return await this.userRepository.findOne(email);
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
