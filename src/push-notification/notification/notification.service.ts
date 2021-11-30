import { Injectable } from '@nestjs/common';
import { FirebaseMessagingService } from '@aginix/nestjs-firebase-admin';

import { IDeviceForSendMessage } from '../device/interfaces/device.interface';
import { IPushMessage } from '../device/interfaces/push-message.interface';
import {
  IResponseService,
  ResponseService,
} from '../../utils/response-service';
import { CustomValidation } from '../../utils/custom-validation';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationService: FirebaseMessagingService) {}

  async sendPushMessage(
    devices: IDeviceForSendMessage[],
    message: IPushMessage,
  ): Promise<IResponseService> {
    const options = {
      priority: 'high',
      timeToLive: 60 * 60 * 24,
    };

    const devicesToken = devices.map((device) => device.deviceToken);

    try {
      await this.notificationService.sendToDevice(
        devicesToken,
        message,
        options,
      );
      return new ResponseService().pushNotificationSent();
    } catch (error) {
      new CustomValidation().serverError(error);
    }
  }
}
