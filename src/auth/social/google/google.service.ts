import { IAuthResponse } from '../../../user/interfaces/user.intarface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CustomValidation } from '../../../utils/custom-validation';
import { statusEnum } from '../../../user/enums/status.enum';
import { roleEnum } from '../../../user/enums/role.enum';
import { User } from '../../../user/user.entity';
import { AuthService } from '../../auth.service';
import { FilesService } from '../../../files/files.service';
import { CreateSocialUserDto } from '../../../user/dto/create-social-user.dto';
import { SocialService } from '../social.service';

@Injectable()
export class GoogleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly filesService: FilesService,
    private readonly socialService: SocialService,
  ) {}

  async googleLogin(body: CreateSocialUserDto): Promise<IAuthResponse> {
    const {
      userID,
      firstName,
      lastName,
      email,
      deviceId,
      platform,
      deviceToken,
    } = body;

    new CustomValidation().socialUnauthorized(userID);

    const user = await this.socialService.getSocialUser(userID, email);

    if (!user) {
      const newGoogleUser = {
        name: firstName,
        surname: lastName,
        email,
        googleId: userID,
        phoneNumber: null,
        status: statusEnum.CONFIRMED,
        noPasswordExist: true,
        role: roleEnum.USER,
        firstLogin: true,
      };

      const createUser = await this.userRepository.save(newGoogleUser);
      const token = await this.authService.signUser(createUser, false);
      const userGoogle = await this.socialService.setSocialAvatar(
        body,
        createUser,
      );

      await this.authService.saveUserDevice(
        createUser,
        deviceId,
        platform,
        deviceToken,
      );

      return { token, user: userGoogle };
    }

    await this.userRepository.update(user.id, { googleId: userID });
    await this.authService.saveUserDevice(
      user,
      deviceId,
      platform,
      deviceToken,
    );

    return this.socialService.updateSocialUser(user, body);
  }
}
