import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { CustomWsValidation } from 'src/utils/custom-ws-validation';
import { AuthService } from '../auth.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken = client.handshake?.headers?.authorization;

      const user = await this.authService.decodeToken(authToken);

      context.switchToHttp().getRequest().user = user;

      return Boolean(user);
    } catch (err) {
      const client: Socket = context.switchToWs().getClient<Socket>();
      client.disconnect();
      new CustomWsValidation().unauthorized();
    }
  }
}
