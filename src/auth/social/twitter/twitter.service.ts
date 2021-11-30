import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../user/user.entity';
import { IAuthResponse } from '../../../user/interfaces/user.intarface';
import { CustomValidation } from '../../../utils/custom-validation';
import { statusEnum } from '../../../user/enums/status.enum';
import { roleEnum } from '../../../user/enums/role.enum';
import { AuthService } from '../../auth.service';
import { FilesService } from '../../../files/files.service';
import { SocialService } from '../social.service';
import { CreateSocialUserDto } from '../../../user/dto/create-social-user.dto';

@Injectable()
export class TwitterService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly filesService: FilesService,
    private readonly socialService: SocialService,
  ) {}

  async twitterLogin(body: CreateSocialUserDto): Promise<IAuthResponse> {
    const {
      userID,
      firstName,
      email,
      userName,
      deviceId,
      platform,
      deviceToken,
    } = body;

    new CustomValidation().socialUnauthorized(userID);

    const user = await this.socialService.getSocialUser(userID, email);

    if (!user) {
      const newTwitterUser = {
        name: firstName,
        userName,
        email,
        twitterId: userID,
        phoneNumber: null,
        status: statusEnum.CONFIRMED,
        noPasswordExist: true,
        role: roleEnum.USER,
        firstLogin: true,
      };

      const createUser = await this.userRepository.save(newTwitterUser);
      const token = await this.authService.signUser(createUser, false);

      const userTwitter = await this.socialService.setSocialAvatar(
        body,
        createUser,
      );

      await this.authService.saveUserDevice(
        createUser,
        deviceId,
        platform,
        deviceToken,
      );

      return { token, user: userTwitter };
    }

    await this.userRepository.update(user.id, { twitterId: userID });
    await this.authService.saveUserDevice(
      user,
      deviceId,
      platform,
      deviceToken,
    );

    return this.socialService.updateSocialUser(user, body);
  }
}
