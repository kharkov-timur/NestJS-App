import {
  forwardRef,
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { SignOptions } from 'jsonwebtoken';

import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { statusEnum } from '../user/enums/status.enum';
import { roleEnum } from '../user/enums/role.enum';
import { TokenService } from '../token/token.service';
import { CreateUserTokenDto } from '../token/dto/create-user-token.dto';
import { IUserToken } from '../token/interfaces/user-token.interface';
import { MailService } from '../mail/mail.service';
import { IReadableUser } from '../user/interfaces/readable-user.interface';
import { SignInDto } from './dto/signin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/fogot-password.dto';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { IUser } from '../user/interfaces/user.intarface';
import { ITokenPayload } from './interfaces/token-payload.interface';
import { CustomValidation } from '../utils/custom-validation';

@Injectable()
export class AuthService {
  private readonly clientAppUrl: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
  ) {
    this.clientAppUrl = this.configService.get<string>('FE_APP_URL');
  }

  public async signUp(CreateUserDto: CreateUserDto): Promise<boolean> {
    const user = await this.userService.createUser(
      CreateUserDto,
      roleEnum.USER,
    );
    await this.sendConfirmation(user);
    return true;
  }

  public async signIn({ email, password }: SignInDto): Promise<IReadableUser> {
    const user = await this.userService.findUserByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = await this.signUser(user, true);

      delete user.password;
      const readableUser: IReadableUser = user as IReadableUser;
      readableUser.accessToken = token;

      return readableUser;
    }
    new CustomValidation().notFound('User', 'email', email, user);
  }

  async signUser(
    { id, status, role }: IUser,
    withStatusCheck: boolean,
  ): Promise<string> {
    if (withStatusCheck && status !== statusEnum.CONFIRMED) {
      new CustomValidation().emailNotConfirmed(status);
    }
    const tokenPayload: ITokenPayload = {
      id,
      status,
      role,
    };

    const token = await this.generateToken(tokenPayload);
    const expireAt = moment().add(1, 'd').toISOString();

    await this.saveToken({
      token,
      expireAt,
      userId: id,
    });

    return token;
  }

  async changePassword(
    user: IUser,
    changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    const { id, status } = user;

    new CustomValidation().emailNotConfirmed(status);

    const password = await this.userService.hashPassword(
      changePasswordDto.password,
    );

    await this.userService.updateUser(id, { password });
    await this.tokenService.deleteAllTokens(id);
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

  async sendConfirmation(user: IUser) {
    const { email } = user;
    const token = await this.signUser(user, false);
    const confirmLink = `${this.clientAppUrl}/auth/confirm?token=${token}`;

    await this.mailService.sendEmailToConfirm(email, confirmLink, token);
  }

  private async generateToken(
    data: ITokenPayload,
    options?: SignOptions,
  ): Promise<string> {
    return this.jwtService.sign(data, options);
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      const data = this.jwtService.verify(token) as ITokenPayload;
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

  async forgotPassword({ email }: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      new CustomValidation().emailNotCorrect();
    }
    const token = await this.signUser(user, true);
    const forgotLink = `${this.clientAppUrl}/auth/forgotPassword?token=${token}&userId=${user.id}`;

    await this.mailService.sendEmailToConfirm(email, forgotLink, token);
  }
}
