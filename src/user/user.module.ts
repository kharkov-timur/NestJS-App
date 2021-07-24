import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { Role } from './role/role.entity';
import { ActivateLink } from './activate-link.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, ActivateLink]),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRES },
    }),
  ],
  exports: [TypeOrmModule, JwtModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
