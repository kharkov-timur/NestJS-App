import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { PaginationDto } from '@shared/pagination.dto';
import { PaginatedUsers } from './dto/paginatedUsers.dto';
import { getTotalPages, takeSkipCalculator } from '../utils/get-total-pages';
import { CreateUserDto } from './dto/create-user.dto';
import { IUser } from './interfaces/user.intarface';
import { roleEnum } from './enums/role.enum';
import { CustomValidation } from '../utils/custom-validation';

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

  async createUser(createUserDto: CreateUserDto): Promise<IUser> {
    const { email, phoneNumber, password } = createUserDto;

    const hashPassword = await this.hashPassword(password);
    const createdUser = {
      ...createUserDto,
      password: hashPassword,
    };

    const userWithEmailExist = await this.userRepository.findOne({
      where: [{ email }],
    });

    const userWithPhoneExist = await this.userRepository.findOne({
      where: [{ phoneNumber }],
    });

    if (userWithEmailExist) {
      new CustomValidation().isExists(
        'User',
        'email',
        email,
        userWithEmailExist,
      );
    }

    if (userWithPhoneExist) {
      new CustomValidation().isExists(
        'User',
        'email',
        phoneNumber,
        userWithPhoneExist,
      );
    }

    return await this.userRepository.save(createdUser);
  }

  async findUser(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<IUser> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async updateUser(id: number, payload: Partial<User>) {
    return this.userRepository.update(id, payload);
  }

  async getAllUsers(): Promise<User[]> {
    // const { page, limit } = paginationDto;
    // const { skip } = takeSkipCalculator(limit, page);
    // .leftJoinAndSelect('users.role', 'role')
    // .take(limit)
    // .skip(skip)
    // const totalPages = getTotalPages(count, limit, page);

    const allUsers = await this.userRepository
      .createQueryBuilder('user')
      .getMany();

    return allUsers;
  }
}
