import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { configModule } from '../configure.root';
import { TokenModule } from '../token/token.module';
import { MailModule } from '../mail/mail.module';
import { JwtAuthModule } from './jwt/jwt-auth.module';
import { SocialModule } from './social/social.module';
import { DeviceModule } from '../push-notification/device/device.module';

@Module({
  imports: [
    TokenModule,
    forwardRef(() => UserModule),
    forwardRef(() => MailModule),
    configModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtAuthModule,
    SocialModule,
    DeviceModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
