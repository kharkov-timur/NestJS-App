import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { roleEnum } from '../../user/enums/role.enum';

@Injectable()
export class AdminJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user || user.role.name != roleEnum.admin) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
