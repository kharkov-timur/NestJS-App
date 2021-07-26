import {
  BadRequestException,
  Injectable,
  MethodNotAllowedException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import _ from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { SignOptions } from 'jsonwebtoken';
import moment from 'moment';

import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { statusEnum } from '../user/enums/status.enum';
import { roleEnum } from '../user/enums/role.enum';
import { TokenService } from '../token/token.service';
import { CreateUserTokenDto } from '../token/dto/create-user-token.dto';
import { IUserToken } from '../token/interfaces/user-token.interface';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { IReadableUser } from '../user/interfaces/readable-user.interface';
import { protectedFieldsEnum } from '../user/enums/protected-fields.enum';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/fogot-password.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  public async signUp(body: CreateUserDto): Promise<boolean> {
    const user = await this.userService.createUser(body, roleEnum.USER);
    const token = await this.authService.signUser(user, false);
    const confirmLink = `${process.env.FRONT_FULL_LINK}/${process.env.CONFIRMATION_LINK}?code=${token}&userId=${user.id}`;
    await this.mailService.sendConfirmation(user, confirmLink);
    return true;
  }

  public async signIn(dto: AuthDto): Promise<IReadableUser> {
    const { email, password } = dto;
    const user = await this.userService.findUserByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = await this.signUser(user);
      const readableUser: IReadableUser = user;
      readableUser.accessToken = token;

      return _.omit<any>(
        readableUser,
        Object.values(protectedFieldsEnum),
      ) as IReadableUser;
    }
    throw new BadRequestException('Invalid credentials');
  }

  async signUser(user: User, withStatusCheck: boolean = true): Promise<string> {
    if (withStatusCheck && user.status !== statusEnum.CONFIRMED) {
      throw new MethodNotAllowedException();
    }
    const { id, status, role } = user;
    const tokenPayload = {
      id,
      status,
      role,
    };

    const token = await this.generateToken(tokenPayload);
    const expireAt = moment().add(1, 'day').toISOString();

    await this.saveToken({
      token,
      expireAt,
      userId: id,
    });

    return token;
  }

  private async generateToken(data, options?: SignOptions): Promise<string> {
    return this.jwtService.sign(data, options);
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      const data = this.jwtService.verify(token);
      const tokenExists = await this.tokenService.existsToken(data.id, token);

      if (tokenExists) {
        return data;
      }
      throw new UnauthorizedException();
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private async saveToken(token: CreateUserTokenDto): Promise<IUserToken> {
    return await this.tokenService.createToken(token);
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    const password = await this.userService.hashPassword(
      changePasswordDto.password,
    );

    await this.userService.updateUser(userId, { password });
    await this.tokenService.deleteAllTokens(userId);
    return true;
  }

  public async confirm(token: string): Promise<any> {
    const data = await this.verifyToken(token);
    const user = await this.userService.findUser(data.id);

    await this.tokenService.deleteToken(data.id, token);

    if (user && user.status === statusEnum.PENDING) {
      user.status = statusEnum.CONFIRMED;
      return await this.userRepository.update(user.id, {
        status: statusEnum.CONFIRMED,
      });
    }
  }

  async forgotPassword(body: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findUserByEmail(body.email);
    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    const token = await this.signUser(user);
    const forgotLink = `${process.env.FRONT_FULL_LINK}/${process.env.CONFIRMATION_LINK}?code=${token}&userId=${user.id}`;

    await this.mailService.sendConfirmation(user, forgotLink);
  }
}
