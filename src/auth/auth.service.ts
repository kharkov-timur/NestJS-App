import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../user/user.entity';
import { ActivateLink } from '../user/activate-link.entity';
import { UserService } from '../user/user.service';
import { RoleService } from '../user/role/role.service';
import { AuthDto } from './dto/auth.dto';
import { IAuthResponse } from '../interfaces/auth.interface';
import { statusEnum } from '../user/enums/status.enum';
import { IUserValidationStrategy } from '@shared/strategires/strategy';
import { roleEnum } from '../user/enums/role.enum';
import { BaseUserDto } from '../user/dto/base-user.dto';
import { CustomValidation } from '../utils/custom-validation';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ActivateLink)
    private readonly activationLinkRepository: Repository<ActivateLink>,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
  ) {}

  public async login(
    body: AuthDto,
    strategy?: IUserValidationStrategy,
  ): Promise<IAuthResponse> {
    const user = await this.userRepository.findOne(
      { email: body.email },
      {
        relations: ['role'],
      },
    );

    if (!user) {
      throw new HttpException(
        'Такого користувача не існує',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.password) {
      throw new HttpException(
        'Ви не встановлювали пароль, бо рееєструвались через гугл, спробуйте авторизацію через гугл, або відновіть пароль',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.status !== statusEnum.CONFIRMED) {
      throw new HttpException(
        'Вам потрібно підтвердити ваш email для успішного логіна',
        HttpStatus.CONFLICT,
      );
    }

    if (strategy) {
      strategy.validate(user);
    }

    const googleUser = await this.userRepository.findOne({
      where: { id: user.id, password: null },
    });
    if (googleUser) {
      throw new UnauthorizedException();
    }

    const areEqual = await compare(String(body.password), user.password);

    if (!areEqual) {
      throw new HttpException('Неправильний пароль', HttpStatus.UNAUTHORIZED);
    }

    delete user.password;
    const token = this.jwtService.sign({ ...user });

    return { token, user };
  }

  private async accessToken(user): Promise<IAuthResponse> {
    const activateLink = uuidv4();
    await Promise.all([
      this.activationLinkRepository.save({
        userId: user.id,
        token: activateLink,
      }),
      // this.mailService.sendInvintationEmail(user.email, activateLink, user.id),
    ]);

    const accessToken = this.jwtService.sign(
      { ...user },
      {
        secret: process.env.SECRET_KEY,
        expiresIn: '2h',
      },
    );

    return { user, token: accessToken };
  }

  public async register(body: BaseUserDto): Promise<IAuthResponse> {
    body.role = await this.roleService.findByName(roleEnum.user);
    const email = body.email;
    const isExists = await this.userRepository.findOne({
      where: { email: email },
    });

    new CustomValidation().isExists(
      'Користувач',
      'такою адресою',
      email,
      isExists,
    );

    const user = await this.userService.createUser(body);
    delete user.password;

    return await this.accessToken(user);
  }
}
