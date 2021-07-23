import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleEnum } from '../../user/user.enum';

@Injectable()
export class AdminGuardJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user || user.role.name != UserRoleEnum.admin) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}