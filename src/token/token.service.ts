import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';

import { Token } from './token.entity';
import { CreateUserTokenDto } from './dto/create-user-token.dto';
import { IUserToken } from './interfaces/user-token.interface';
import { User } from '../user/user.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async createToken(body: CreateUserTokenDto): Promise<IUserToken> {
    return this.tokenRepository.save(body);
  }

  async deleteToken(token: string): Promise<DeleteResult> {
    return this.tokenRepository.delete({ token });
  }

  async deleteConfirmToken(user: User): Promise<DeleteResult> {
    const token = await this.tokenRepository.findOne({
      where: { user },
    });

    return this.tokenRepository.delete(token.id);
  }

  async deleteAllTokens(userId: number): Promise<Token[] | void> {
    const findAll = await this.tokenRepository.find({
      where: { userId },
    });

    if (findAll) {
      return this.tokenRepository.remove(findAll);
    }

    return;
  }

  async existsToken(userId: number, token: string): Promise<boolean> {
    const findToken = await this.tokenRepository.findOne({
      where: { userId, token },
    });

    return !!findToken;
  }

  async checkUserByToken(token: string): Promise<boolean> {
    const tokenWithUser = await this.tokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    return Boolean(tokenWithUser.user);
  }
}
