import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthService } from 'src/auth/auth.service';
import { ServerOptions } from 'socket.io';

export class AuthenticatedWsAdapter extends IoAdapter {
  private readonly authService: AuthService;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.authService = this.app.get(AuthService);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    options.allowRequest = async (request, allowFunction) => {
      const token = request.headers?.authorization;

      const user = await this.authService.decodeTokenForWs(token);

      if (user) {
        return allowFunction(null, true);
      }

      return allowFunction('Bad request', false);
    };
    return super.createIOServer(port, options);
  }
}
