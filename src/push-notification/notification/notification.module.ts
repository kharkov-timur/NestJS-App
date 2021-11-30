import { Module } from '@nestjs/common';
import { FirebaseAdminModule } from '@aginix/nestjs-firebase-admin';
import * as admin from 'firebase-admin';

import { NotificationService } from './notification.service';
import * as path from 'path';

const serviceAccount = path.join(__dirname, './firebase.json');

@Module({
  imports: [
    FirebaseAdminModule.forRootAsync({
      useFactory: () => ({
        credential: admin.credential.cert(serviceAccount),
      }),
    }),
  ],
  providers: [NotificationService],
})
export class NotificationModule {}
