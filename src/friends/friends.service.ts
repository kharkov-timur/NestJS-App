import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

import { UserService } from '../user/user.service';
import { Friends } from './friends.entity';
import { CustomValidation } from '../utils/custom-validation';
import { IResponseService, ResponseService } from '../utils/response-service';
import { statusEnum } from '../user/enums/status.enum';
import { IFriend } from './interfaces/friends.interface';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friends)
    private friendRepository: Repository<Friends>,
    private readonly userService: UserService,
  ) {}

  private async checkUsers(
    followerId: number,
    followeeId: number,
  ): Promise<HttpException | any> {
    const [followee, follower] = await Promise.all([
      this.userService.findUser(followeeId),
      this.userService.findUser(followerId),
    ]);

    this.userService.checkStatusAndUserFound({
      user: follower,
      userId: followerId,
    });

    this.userService.checkStatusAndUserFound({
      user: followee,
      userId: followeeId,
    });

    return { followee, follower };
  }

  public async getAllFollowers(
    reqUserId: number,
    options: IPaginationOptions,
  ): Promise<Pagination<IFriend>> {
    return paginate<IFriend>(this.friendRepository, options, {
      where: { followee: reqUserId, status: statusEnum.CONFIRMED },
      order: { follower: 'DESC' },
      relations: ['follower'],
    });
  }

  public async getAllRequest(reqUserId: number): Promise<IFriend[]> {
    return this.friendRepository.find({
      where: { followee: reqUserId, status: statusEnum.PENDING },
      order: { follower: 'DESC' },
      relations: ['follower'],
    });
  }

  public async subscribeToUser(
    followerId: number,
    followeeId: number,
  ): Promise<IResponseService> {
    const { followee, follower } = await this.checkUsers(
      followerId,
      followeeId,
    );

    const isSubscribe = await this.friendRepository.findOne({
      where: { follower, followee },
    });

    if (isSubscribe) {
      new CustomValidation().subscribedToUser();
    }

    await this.friendRepository.save({
      follower,
      followee,
      status: statusEnum.PENDING,
    });

    await this.friendRepository.save({
      follower: followee,
      followee: follower,
    });

    return new ResponseService().friendRequest();
  }

  public async confirmRequest(
    followeeId: number,
    followerId: number,
  ): Promise<IResponseService> {
    const { followee, follower } = await this.checkUsers(
      followerId,
      followeeId,
    );

    const findRequest = await this.friendRepository.findOne({
      where: {
        followee: followee.id,
        follower: follower.id,
        status: statusEnum.PENDING,
      },
    });

    if (!findRequest) {
      new CustomValidation().requestToUserNotFound();
    }

    const findRequester = await this.friendRepository.findOne({
      where: { follower: followee.id, followee: follower.id },
    });

    findRequest.status = statusEnum.CONFIRMED;
    findRequester.status = statusEnum.CONFIRMED;

    await this.friendRepository.save(findRequest);
    await this.friendRepository.save(findRequester);

    return new ResponseService().confirmRequestToUser();
  }

  public async unsubscribeToUser(
    followeeId: number,
    followerId: number,
  ): Promise<IResponseService> {
    const { followee, follower } = await this.checkUsers(
      followerId,
      followeeId,
    );

    const [findRequest, findRequester] = await Promise.all([
      this.friendRepository.findOne({
        where: { followee: followee.id, follower: follower.id },
      }),
      this.friendRepository.findOne({
        where: { follower: followee.id, followee: follower.id },
      }),
    ]);

    await this.friendRepository.delete(findRequest.id);
    await this.friendRepository.delete(findRequester.id);

    return new ResponseService().unsubscribeToUser();
  }
}
