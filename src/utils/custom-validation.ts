import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

import { User } from 'src/user/user.entity';

export class CustomValidation {
  notFound(
    entityName: string,
    fieldName: string,
    fieldValue: string | number,
    searchResult: User,
    deleteResult?: DeleteResult,
  ): HttpException | void {
    if (
      (!searchResult && !deleteResult) ||
      (!searchResult && !deleteResult.affected)
    ) {
      throw new NotFoundException(
        `${entityName} з ${fieldName}: ${fieldValue} не знайдено`,
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
      throw new HttpException(
        `${entityName} з ${fieldName}: ${fieldValue} вже існує`,
        409,
      );
    }
  }

  noAccess(currentUserId: boolean, role?: string): HttpException | void {
    if (!currentUserId && role !== 'admin') {
      throw new ForbiddenException(`Користувач не має доступу!`);
    }
  }

  socialUnauthorized(socialKey: string): HttpException | void {
    if (!socialKey) {
      throw new UnauthorizedException(`Сталася помилка авторизації!`);
    }
  }

  userUnauthorized(id: number): HttpException | void {
    if (!id) {
      throw new UnauthorizedException(`Користувача з ID: ${id} не знайдено! `);
    }
  }

  emailNotConfirmed(status: string): HttpException | void {
    if (status !== 'confirmed') {
      throw new ForbiddenException(
        `Спочатку вам потрібно підтвердити поточну пошту`,
      );
    }
  }

  passwordMismatch(
    password: string,
    confirmedPassword: string,
  ): HttpException | void {
    if (password !== confirmedPassword) {
      throw new BadRequestException(`Пароль не співпадає`);
    }
  }
}

export function enumValidationMessage(args: ValidationArguments): string {
  return `${args.value} у полі ${
    args.property
  } повинно мати одне із валідних значень: ${Object.values(
    args.constraints[0],
  )}`;
}
