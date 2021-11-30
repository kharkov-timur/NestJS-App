import * as bcrypt from 'bcrypt';
import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import * as fs from 'fs';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ICheckStatusAndUserFound, IUser } from './interfaces/user.intarface';
import { CustomValidation } from '../utils/custom-validation';
import { UpdateUserDto } from './dto/update-user.dto';
import { statusEnum } from './enums/status.enum';
import { IResponseService, ResponseService } from '../utils/response-service';
import { TokenService } from '../token/token.service';
import { AuthService } from '../auth/auth.service';
import { IFile } from '../files/interfaces/files.interface';
import { File } from '../files/files.entity';
import { ImageUtilsService } from '../files/image/image-utils.service';
import { FilesService } from '../files/files.service';
import { Event } from '../events/event.entity';
import { UserHobbiesDto } from './dto/user-hobbies.dto';
import { dateConvertor, TODAY } from '../utils/work-with-time';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private tokenService: TokenService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private imageUtilsService: ImageUtilsService,
    private filesService: FilesService,
  ) {}

  async saveUser(user: IUser): Promise<User> {
    return this.userRepository.save(user);
  }

  async createUser(createUserDto: CreateUserDto): Promise<IUser> {
    const { email, phoneNumber, password } = createUserDto;

    const hashPassword = await this.hashPassword(password);
    const createdUser = {
      ...createUserDto,
      password: hashPassword,
      firstLogin: true,
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
        'phone number',
        phoneNumber,
        userWithPhoneExist,
      );
    }

    return this.userRepository.save(createdUser);
  }

  async getAllUsersWithPagination(
    options: IPaginationOptions,
  ): Promise<Pagination<User>> {
    return paginate<User>(this.userRepository, options, {
      where: { status: 'confirmed' },
      relations: [
        'mainImg',
        'files',
        'events',
        'eventsOwned',
        'chats',
        'messages',
      ],
    });
  }

  public checkStatusAndUserFound({
    user,
    userId,
    email,
    phoneNumber,
  }: ICheckStatusAndUserFound): User {
    if (!user && userId) {
      new CustomValidation().notFound('User', 'id', userId, user);
    }

    if (!user && email) {
      new CustomValidation().notFound('User', 'email', email, user);
    }

    if (!user && phoneNumber) {
      new CustomValidation().notFound('User', 'phone', phoneNumber, user);
    }

    if (user.status === statusEnum.REMOVED) {
      new CustomValidation().userIsRemoved('User', 'id', userId);
    }

    if (user.status === statusEnum.PERMANENT_BLOCKED) {
      new CustomValidation().userIsPermanentBlocked();
    }

    return user;
  }

  async findUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'mainImg',
        'files',
        'events',
        'events.mainImg',
        'events.files',
        'chats',
        'chatsOwned',
        'messages',
      ],
    });

    this.checkStatusAndUserFound({ user, userId });

    return user;
  }

  async getUserChat(id: number): Promise<User> {
    const chat = await this.userRepository.findOne({
      where: { id },
      relations: ['chats'],
    });

    if (!chat) {
      new CustomValidation().notFound('Chat', 'id', id, chat);
    }

    return chat;
  }

  async userWithEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    this.checkStatusAndUserFound({ user, email });

    return user;
  }

  async findUserByEmailWithPassword(email: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .leftJoinAndSelect('user.mainImg', 'mainImg')
      .leftJoinAndSelect('user.files', 'files')
      .getOne();

    this.checkStatusAndUserFound({ user, email });

    if (!user.password) {
      new CustomValidation().nonePassword();
    }

    return user;
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    authorization: string,
  ): Promise<User | IResponseService> {
    const user = await this.userRepository.findOne(id);
    this.checkStatusAndUserFound({ user, userId: id });

    const { email, phoneNumber } = updateUserDto;
    const neededVerify = { email: false, phoneNumber: false };

    if (email) {
      if (user.email === email) {
        new CustomValidation().specifiedEmailExists();
      }

      if (!user.email || user.email) {
        updateUserDto.status = statusEnum.PENDING;
        await this.userRepository.update(id, {
          email,
        });
      }

      neededVerify.email = true;
    }

    if (phoneNumber) {
      await this.userWithPhone(phoneNumber);

      updateUserDto.status = statusEnum.PENDING;
      await this.userRepository.update(id, {
        phoneNumber,
      });

      neededVerify.phoneNumber = true;
    }

    await this.userRepository.update(id, {
      ...updateUserDto,
    });

    if (Object.values(neededVerify).some((el) => el)) {
      if (neededVerify.email) {
        const cleanToken = authorization.split(' ')[1];
        await this.tokenService.deleteToken(cleanToken); // change to blacklist tokens

        const userForEmail = await this.userRepository.findOne(id);
        await this.authService.sendChangeEmailConfirmation(userForEmail);
      }

      return new ResponseService().updateUserSuccessNeedVerify({
        ...(email && { email }),
        ...(phoneNumber && {
          phone: phoneNumber,
        }),
      });
    }

    return this.userRepository.findOne({
      where: { id },
      relations: ['mainImg', 'files'],
    });
  }

  async userHobbies(
    id: number,
    userHobbiesDto: UserHobbiesDto,
  ): Promise<User | HttpException> {
    const user = await this.userRepository.findOne(id);
    this.checkStatusAndUserFound({ user, userId: id });

    await this.userRepository.update(id, {
      hobbies: userHobbiesDto.hobbies,
      firstLogin: false,
    });

    return this.findUser(id);
  }

  async deleteUser(id: number): Promise<IResponseService> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['files', 'events'],
    });

    this.checkStatusAndUserFound({ user, userId: id });

    const { files } = user;

    if (user.events.length) {
      const actualEvents = user.events.filter(
        (event) => dateConvertor(event.endDate) >= TODAY,
      );

      if (actualEvents.length) {
        return new ResponseService().deletedUserCanceled(actualEvents.length);
      }

      await this.userRepository.update(id, {
        status: statusEnum.REMOVED,
      });
      await this.tokenService.deleteAllTokens(id);

      return new ResponseService().deleteUserSuccess();
    }

    await this.userRepository
      .createQueryBuilder('user')
      .delete()
      .where('id = :id', { id })
      .execute();

    if (files.length) {
      const filesToDelete = files.map((file) => file.name);
      await this.filesService.deleteImage(filesToDelete);
    }

    await this.tokenService.deleteAllTokens(id);

    return new ResponseService().deleteUserSuccess();
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(JSON.parse(process.env.SALT));
    return bcrypt.hash(password, salt);
  }

  async userWithPhone(phoneNumber: string) {
    const user = await this.userRepository.findOne({ where: { phoneNumber } });
    this.checkStatusAndUserFound({ user, phoneNumber });

    return user;
  }

  async uploadImage(userId: number, file: IFile): Promise<IResponseService> {
    const relatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['mainImg', 'files'],
    });

    const { files } = relatedUser;

    if (files.length) {
      const fileNames = files.map((item) => item.name);
      await this.filesService.deleteImage(fileNames);
    }

    if (!relatedUser) {
      await fs.promises.unlink(file.path);
      new CustomValidation().notFound('User', 'id', userId, relatedUser);
    }

    const { cropped, original } =
      await this.imageUtilsService.fileNameGenerator({
        file,
        relatedUser,
        fileRepository: this.fileRepository,
      });

    await this.userRepository.update(userId, { mainImg: original });

    const fileNamesFromGoogle: string[] = [original.name];
    fileNamesFromGoogle.push(cropped.name);

    await this.imageUtilsService.uploadToGoogleStorage(fileNamesFromGoogle);

    return new ResponseService().uploadImageSuccess(original.name);
  }

  async deleteImage(imgName: string): Promise<IResponseService> {
    const imgNames = [];
    imgNames.push(imgName, `cropped-${imgName}`);

    return this.filesService.deleteImage(imgNames);
  }
}
