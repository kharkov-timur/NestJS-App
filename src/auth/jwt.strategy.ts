import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { User } from '../user/user.entity';
import { TokenService } from '../token/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('SECRET_KEY'),
      passReqToCallback: true,
      // ignoreExpiration: false,
    });
  }

  async validate(req, user: Partial<User>) {
    const token = req.headers.authorization.slice(7);
    const tokenExists = await this.tokenService.existsToken(user.id, token);
    if (tokenExists) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }
}
