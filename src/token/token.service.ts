import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';

import { Token } from './token.entity';
import { CreateUserTokenDto } from './dto/create-user-token.dto';
import { IUserToken } from './interfaces/user-token.interface';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async createToken(body: CreateUserTokenDto): Promise<IUserToken> {
    return await this.tokenRepository.save(body);
  }

  async deleteToken(userId: number, token: string): Promise<DeleteResult> {
    return await this.tokenRepository.delete({ userId, token });
  }

  async deleteAllTokens(userId: number): Promise<void> {
    const findAll = await this.tokenRepository.find({
      where: { userId },
    });

    findAll.forEach((item) => {
      return this.tokenRepository.delete(item.token);
    });
  }

  async existsToken(userId: number, token: string): Promise<boolean> {
    const findToken = await this.tokenRepository.findOne({
      where: { userId, token },
    });

    return !!findToken;
  }
}
