import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEvents } from './users-events.entity';

@Injectable()
export class UsersEventsService {
  constructor(
    @InjectRepository(UsersEvents)
    private usersEventsRepository: Repository<UsersEvents>,
  ) {}

  public async getData() {
    return this.usersEventsRepository.find();
  }
}
