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
import { SignInDto } from './dto/signin.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { IReadableUser } from '../user/interfaces/readable-user.interface';
import { ForgotPasswordDto } from './dto/fogot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../user/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtAuthGuard } from './jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-up')
  async signUp(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<boolean> {
    return this.authService.signUp(createUserDto);
  }

  @Get('/confirm')
  async confirm(
    @Query(new ValidationPipe()) query: ConfirmAccountDto,
  ): Promise<boolean> {
    await this.authService.confirm(query.token);
    return true;
  }

  @Post('/sign-in')
  public async signIn(
    @Body(new ValidationPipe()) signInDto: SignInDto,
  ): Promise<IReadableUser> {
    return this.authService.signIn(signInDto);
  }

  @Post('/forgot-password')
  public async forgotPassword(
    @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto,
  ): Promise<any> {
    await this.authService.forgotPassword(forgotPasswordDto);
    return { message: 'Email sent' };
  }

  @Patch('/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetUser() user: User,
    @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    return this.authService.changePassword(user, changePasswordDto);
  }
}
