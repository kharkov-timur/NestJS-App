import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../components/decorators/get-user.decorator';

import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { IReadableUser } from '../user/interfaces/readable-user.interface';
import { ForgotPasswordDto } from './dto/fogot-password.dto';
import { IUser } from '../user/interfaces/user.intarface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signUp')
  async signUp(
    @Body(ValidationPipe) CreateUserDto: CreateUserDto,
  ): Promise<boolean> {
    return this.authService.signUp(CreateUserDto);
  }

  @Get('/confirm')
  async confirm(@Query(ValidationPipe) query: ConfirmAccountDto) {
    await this.authService.confirm(query.token);
    return true;
  }

  @Post('/signIn')
  public async signIn(
    @Body(new ValidationPipe()) dto: AuthDto,
  ): Promise<IReadableUser> {
    return this.authService.signIn(dto);
  }

  @Post('/forgotPassword')
  public async forgotPassword(
    @GetUser() user: IUser,
    @Body(new ValidationPipe()) dto: ForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(dto);
  }

  @Patch('/changePassword')
  @UseGuards(AuthGuard())
  async changePassword(
    @GetUser() user: IUser,
    @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    return this.authService.changePassword(user.id, changePasswordDto);
  }
}
