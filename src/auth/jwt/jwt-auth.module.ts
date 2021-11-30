import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthStrategy } from './jwt-auth.strategy';
import { TokenModule } from '../../token/token.module';
import { AuthModule } from '../auth.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('SECRET_KEY'),
          signOptions: {
            expiresIn: configService.get<string>('EXPIRES_IN'),
          },
        };
      },
      inject: [ConfigService],
    }),
    TokenModule,
    forwardRef(() => AuthModule),
  ],
  providers: [JwtAuthStrategy],
  exports: [JwtModule],
})
export class JwtAuthModule {}
