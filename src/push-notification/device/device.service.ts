import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { Repository } from 'typeorm';
import { IDevice } from './interfaces/device.interface';
import { CustomValidation } from '../../utils/custom-validation';
import { User } from '../../user/user.entity';
import { Monitor } from '../../events/monitor/monitor.entity';
import {
  IResponseService,
  ResponseService,
} from '../../utils/response-service';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Monitor)
    private readonly monitorRepository: Repository<Monitor>,
  ) {}

  async getDevice(deviceId: string, platform: string): Promise<IDevice> {
    const device = await this.deviceRepository.findOne({
      where: { deviceId, platform },
    });

    if (!device) {
      new CustomValidation().notFound('Device', 'id', deviceId, device);
    }

    return device;
  }

  async getDevices(userId: number): Promise<IDevice[]> {
    const devices = await this.deviceRepository.find({
      where: { userOwner: userId },
    });
    if (!devices) {
      new CustomValidation().notFound(
        'Devices for user',
        'id',
        userId,
        devices,
      );
    }

    return devices;
  }

  async saveDevice(
    user: User,
    deviceId: string,
    platform: string,
    deviceToken: string,
  ): Promise<IDevice> {
    const device = await this.deviceRepository.findOne({
      where: { deviceId, platform, userOwner: user.id },
    });

    const monitor = await this.monitorRepository.findOne({
      where: { userOwner: user.id },
    });

    if (device) {
      await this.deviceRepository.update(device.id, {
        deviceToken,
      });

      return this.getDevice(deviceId, platform);
    }

    return this.deviceRepository.save({
      userOwner: user,
      monitorForDevice: monitor ? monitor : null,
      deviceId,
      platform,
      deviceToken,
    });
  }

  async deleteDevice(
    userId: number,
    deviceId: string,
  ): Promise<IResponseService> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const device = await this.deviceRepository.findOne({
      where: { deviceId },
    });

    if (!device) {
      new CustomValidation().notFound('Device', 'id', deviceId, device);
    }

    await this.deviceRepository.delete({
      id: device.id,
      userOwner: user,
    });

    return new ResponseService().deleteDeviceSuccess(deviceId);
  }
}
