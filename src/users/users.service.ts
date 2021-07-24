import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/user.dto';
import { User } from '../users/user.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  public async save(createUserDto: CreateUserDto): Promise<User> {
    return this.usersRepository.save(createUserDto);
  }

  public async getUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ email });
  }

  public async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
