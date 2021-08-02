import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { User } from 'src/user/user.entity';
import { IUser } from '../user/interfaces/user.intarface';
import { statusEnum } from '../user/enums/status.enum';
import { roleEnum } from '../user/enums/role.enum';

export class CustomValidation {
  notFound(
    entityName: string,
    fieldName: string,
    fieldValue: string | number,
    searchResult: IUser,
    deleteResult?: DeleteResult,
  ): HttpException | void {
    if (
      (!searchResult && !deleteResult) ||
      (!searchResult && !deleteResult.affected)
    ) {
      throw new NotFoundException(
        `${entityName} with ${fieldName}: ${fieldValue} not found`,
      );
    }
  }

  isExists(
    entityName: string,
    fieldName: string,
    fieldValue: string,
    searchResult: User,
  ): HttpException | void {
    if (searchResult) {
      throw new ConflictException(
        `${entityName} with ${fieldName}: ${fieldValue} is exist`,
      );
    }
  }

  noAccess(currentUserId: boolean, role?: string): HttpException | void {
    if (!currentUserId && role !== roleEnum.ADMIN) {
      throw new ForbiddenException(`User doesn't have access!`);
    }
  }

  emailNotConfirmed(status: string): HttpException | void {
    if (status !== statusEnum.CONFIRMED) {
      throw new ForbiddenException(
        `You will need to confirm your current mail first`,
      );
    }
  }

  emailNotCorrect(): HttpException | void {
    throw new BadRequestException(`Email is not correct`);
  }
}
