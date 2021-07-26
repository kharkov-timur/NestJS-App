import { Inject, Injectable } from '@nestjs/common';
import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import * as path from 'path';

import { User } from '../user/user.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MailService {
  constructor(
    @Inject(MailerService)
    private mailerService: MailerService,
    private authService: AuthService,
  ) {}

  public async sendConfirmation(
    user: User,
    confirmLink: string,
  ): Promise<boolean> {
    const token = await this.authService.signUser(user, false);
    const frontUrl = `${process.env.FRONT_URL}?${token}`;

    return await this.sendMailPromise({
      to: process.env.FROM_SENDER,
      template: 'register-invite',
      subject: 'Email confirmation',
      text: 'Confirm your email',
      context: {
        url: confirmLink,
        frontUrl,
      },
    });
  }

  private sendMailPromise(options: ISendMailOptions): Promise<boolean> {
    if (options.template)
      options.template = path.join(
        __dirname,
        '../../src/mail/templates',
        options.template + '.pug',
      );

    options.from =
      `<${process.env.SMTP_BASE_FROM}>` || `<${process.env.FROM_SENDER}>`;

    return new Promise((res, rej) => {
      this.mailerService.sendMail(options).then(res).catch(rej);
    });
  }
}
