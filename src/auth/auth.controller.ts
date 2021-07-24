import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleService } from '../user/role/role.service';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { IAuthResponse } from '../interfaces/auth.interface';
import { CreateUserDto } from '../user/dto/create-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private roleService: RoleService,
    private authService: AuthService,
  ) {}

  @Post('login')
  public async login(@Body() dto: AuthDto): Promise<IAuthResponse> {
    return this.authService.login(dto);
  }

  @Post('register')
  public async register(@Body() dto: CreateUserDto): Promise<IAuthResponse> {
    return this.authService.register(dto);
  }
}
