import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../user/user.entity';
import { CreateSocialUserDto } from '../../user/dto/create-social-user.dto';
import { IAuthResponse } from '../../user/interfaces/user.intarface';
import { FilesService } from '../../files/files.service';
import { AuthService } from '../auth.service';
import { File } from '../../files/files.entity';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private readonly authService: AuthService,
    private readonly filesService: FilesService,
  ) {}

  public async getSocialUser(userID, email): Promise<User> {
    return this.userRepository.findOne({
      where: [
        { googleId: userID },
        { facebookId: userID },
        { twitterId: userID },
        { email },
      ],
      relations: ['mainImg', 'files'],
    });
  }

  public async updateSocialUser(
    user: User,
    body: CreateSocialUserDto,
  ): Promise<IAuthResponse> {
    const { userID, firstName, lastName, email, firstLogin } = body;
    const { id, name, surname, email: userEmail } = user;
    if (name !== firstName || surname !== lastName) {
      const updatedUser = {
        name: firstName,
        surname: lastName,
      };

      await this.userRepository.update(id, { ...updatedUser });
    }

    if (!userEmail) {
      await this.userRepository.update(id, { email });
    }

    await this.setSocialAvatar(body, user);

    if (firstLogin === false) {
      await this.userRepository.update(user.id, {
        firstLogin,
      });
    }

    const getUser = await this.getSocialUser(userID, email);
    const token = await this.authService.signUser(getUser, true);

    return { token, user: getUser };
  }

  async setSocialAvatar(
    body: CreateSocialUserDto,
    createUser: User,
  ): Promise<User> {
    const { userID, imageURL } = body;
    const user = await this.userRepository.findOne({
      where: [
        { googleId: userID },
        { facebookId: userID },
        { twitterId: userID },
      ],
      relations: ['mainImg', 'files'],
    });

    if (user.mainImg && user.mainImg.name !== imageURL) {
      const { files } = user;

      if (files.length) {
        const filesToDelete = files.map((file) => file.name);
        await this.filesService.deleteImage(filesToDelete);
      }

      await this.saveAvatar(imageURL, user);
    }

    if (!user.mainImg && imageURL) {
      await this.saveAvatar(imageURL, createUser);
    }

    return this.userRepository.findOne({
      where: { id: user.id },
      relations: ['mainImg', 'files'],
    });
  }

  private async saveAvatar(imageURL: string, user: User) {
    const original = await this.fileRepository.save({
      name: imageURL,
      user,
    });

    await this.userRepository.update(user.id, { mainImg: original });
  }
}
