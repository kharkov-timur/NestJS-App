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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../components/decorators/get-user.decorator';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import { IReadableUser } from '../user/interfaces/readable-user.interface';
import { ForgotPasswordDto } from './dto/fogot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../user/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { IResponseService } from 'src/utils/response-service';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { ResendMessageDto } from './dto/resend-message.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/initial')
  @ApiOperation({ summary: 'Initial value for front' })
  @ApiResponse({
    description: `Initial value for front`,
  })
  getInitialValue(): { types: string[]; hobbies: string[] } {
    return this.authService.getInitialValue();
  }

  @Post('/sign-up')
  async signUp(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<IResponseService> {
    return this.authService.signUp(createUserDto);
  }

  @Get('/confirm')
  async confirm(
    @Query(new ValidationPipe()) query: ConfirmAccountDto,
  ): Promise<IResponseService> {
    return this.authService.confirm(query.token);
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
  ): Promise<IResponseService> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/change-password')
  async changePassword(
    @GetUser() userInfo: User,
    @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto,
  ): Promise<IResponseService> {
    return this.authService.changePassword(userInfo.id, changePasswordDto);
  }

  @Post('/resend-message')
  public async resendMessage(
    @Body() resendMessageDto: ResendMessageDto,
  ): Promise<IResponseService> {
    return this.authService.resendMessage(resendMessageDto);
  }
}
