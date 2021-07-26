import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { configModule } from './configure.root';
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    configModule,
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: JSON.parse(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      synchronize: JSON.parse(process.env.PORSTRES_SYNCHRONIZE),
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['database/migration/seed/**/*.js'],
      autoLoadEntities: true,
      cli: {
        entitiesDir: 'src',
        migrationsDir: 'database/migration/seed',
      },
      ssl: { rejectUnauthorized: false },
    }),
    AuthModule,
    TokenModule,
    UserModule,
    MailModule,
  ],
})
export class AppModule {}
