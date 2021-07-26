import { createParamDecorator } from '@nestjs/common';
import { IUser } from '../../user/interfaces/user.intarface';

export const GetUser = createParamDecorator((req, data): IUser => req.user);
