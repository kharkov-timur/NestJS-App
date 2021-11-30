import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { SignOptions } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { CreateUserTokenDto } from '../token/dto/create-user-token.dto';
import { MailService } from '../mail/mail.service';
import { SignInDto } from './dto/signin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/fogot-password.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { IUser } from '../user/interfaces/user.intarface';
import { CustomValidation } from '../utils/custom-validation';
import { IUserToken } from '../token/interfaces/user-token.interface';
import { IReadableUser } from '../user/interfaces/readable-user.interface';
import { ITokenPayload } from './interfaces/token-payload.interface';
import { IResponseService, ResponseService } from '../utils/response-service';
import { statusEnum } from '../user/enums/status.enum';
import { CustomWsValidation } from '../utils/custom-ws-validation';
import { DeviceService } from '../push-notification/device/device.service';
import { HOBBIES, TYPES } from '../constants/constants';
import { ResendMessageDto } from './dto/resend-message.dto';
import { IDevice } from '../push-notification/device/interfaces/device.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
    private readonly deviceService: DeviceService,
  ) {}

  public getInitialValue(): { types: string[]; hobbies: string[] } {
    return {
      types: TYPES,
      hobbies: HOBBIES,
    };
  }

  public async saveUserDevice(
    user: User,
    deviceId: string,
    platform: string,
    deviceToken: string,
  ): Promise<IDevice | null> {
    if (deviceId && platform && deviceToken) {
      return this.deviceService.saveDevice(
        user,
        deviceId,
        platform,
        deviceToken,
      );
    }

    return null;
  }

  public async signUp(createUserDto: CreateUserDto): Promise<IResponseService> {
    const user = await this.userService.createUser(createUserDto);
    await this.sendConfirmation(user);
    return new ResponseService().createUserSuccess();
  }

  public async signIn({
    email,
    password,
    deviceId,
    platform,
    deviceToken,
    firstLogin,
  }: SignInDto): Promise<IReadableUser> {
    const user = await this.userService.findUserByEmailWithPassword(email);
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      new CustomValidation().incorrectPassword();
    }

    await this.saveUserDevice(user, deviceId, platform, deviceToken);

    const token = await this.signUser(user, true);

    let updatedUser = user;

    if (firstLogin === false) {
      await this.userRepository.update(user.id, {
        firstLogin,
      });
      updatedUser = await this.userService.findUser(user.id);
    }

    delete user.password;
    const readableUser: IReadableUser = updatedUser as IReadableUser;
    readableUser.accessToken = token;

    return readableUser;
  }

  async signUser(
    { id, status, role, name, surname }: IUser,
    withStatusCheck: boolean,
  ): Promise<string> {
    if (status === statusEnum.REMOVED) {
      new CustomValidation().userIsRemoved('User', 'id', id);
    }

    if (withStatusCheck && status !== statusEnum.CONFIRMED) {
      new CustomValidation().emailNotConfirmed(status);
    }

    const tokenPayload: ITokenPayload = {
      id,
      status,
      role,
      name,
      surname,
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
    reqUserId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<IResponseService> {
    const { confirmNewPassword, newPassword, currentPassword } =
      changePasswordDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: reqUserId })
      .addSelect('user.password')
      .getOne();

    this.userService.checkStatusAndUserFound({ user, userId: reqUserId });

    new CustomValidation().emailNotConfirmed(user.status);
    new CustomValidation().passwordMismatch(newPassword, confirmNewPassword);

    const checkPassword = await bcrypt.compare(currentPassword, user.password);

    if (!checkPassword) {
      new CustomValidation().incorrectPassword();
    }

    const hashNewPassword = await this.userService.hashPassword(newPassword);
    await this.userRepository.update(reqUserId, {
      password: hashNewPassword,
    });

    await this.tokenService.deleteAllTokens(reqUserId);
    return new ResponseService().passwordChangeSuccess();
  }

  public async confirm(token: string): Promise<IResponseService> {
    const data = await this.verifyToken(token);
    const user = await this.userService.findUser(data.id);

    await this.tokenService.deleteToken(token);
    await this.userRepository.update(user.id, {
      status: statusEnum.CONFIRMED,
    });

    return new ResponseService().emailConfirmSuccess();
  }

  async sendConfirmation(user: IUser): Promise<boolean> {
    const { email } = user;
    const token = await this.signUser(user, false);
    const confirmLink = `${this.configService.get<string>(
      'BASE_URL',
    )}/auth/confirm?token=${token}`;

    return this.mailService.sendEmailToConfirm(email, token, confirmLink);
  }

  async sendChangeEmailConfirmation(user: IUser): Promise<boolean> {
    const { email } = user;
    const token = await this.signUser(user, false);
    const confirmLink = `${this.configService.get<string>(
      'BASE_URL',
    )}/auth/confirm?token=${token}`;

    return this.mailService.sendChangeEmailToConfirm(email, token, confirmLink);
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

      if (!tokenExists) {
        throw new UnauthorizedException();
      }
      return data;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private async saveToken(token: CreateUserTokenDto): Promise<IUserToken> {
    return this.tokenService.createToken(token);
  }

  async forgotPassword({
    email,
  }: ForgotPasswordDto): Promise<IResponseService> {
    const user = await this.userService.userWithEmail(email);

    if (!user) {
      new CustomValidation().emailNotCorrect();
    }

    const temporaryPassword = Math.random().toString(36).slice(2);
    const hashPassword = await this.userService.hashPassword(temporaryPassword);

    await this.userRepository.update(user.id, {
      password: hashPassword,
    });

    await this.mailService.sendTemporaryPassword(email, temporaryPassword);

    return new ResponseService().emailSent();
  }

  public decodeToken(token: string): any {
    try {
      const bearer = token.split(' ')[0];
      const clearToken = token.split(' ')[1];

      if (bearer !== 'Bearer' || !clearToken) {
        new CustomValidation().badAuth();
      }

      const result = this.jwtService.verify(clearToken);
      if (!result) {
        new CustomValidation().badAuth();
      }

      return this.jwtService.decode(clearToken);
    } catch (err) {
      new CustomValidation().badAuth();
    }
  }

  public async decodeTokenForWs(token: string): Promise<any> {
    try {
      const bearer = token.split(' ')[0];
      const clearToken = token.split(' ')[1];

      if (bearer !== 'Bearer' || !clearToken) {
        new CustomWsValidation().badAuth();
      }

      const existUser = await this.tokenService.checkUserByToken(clearToken);

      if (!existUser) {
        return null;
      }

      return this.jwtService.decode(clearToken);
    } catch (err) {
      return false;
    }
  }

  async resendMessage(body: ResendMessageDto): Promise<IResponseService> {
    const { email } = body;
    const user = await this.userService.userWithEmail(email);

    await this.tokenService.deleteConfirmToken(user);
    await this.sendConfirmation(user);

    return new ResponseService().emailSent();
  }
}
