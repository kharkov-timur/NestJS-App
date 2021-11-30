import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EventsMonitorDto } from './dto/events-monitor.dto';
import { Monitor } from './monitor.entity';
import { User } from '../../user/user.entity';
import { CustomValidation } from '../../utils/custom-validation';
import {
  IResponseService,
  ResponseService,
} from '../../utils/response-service';
import { Device } from '../../push-notification/device/device.entity';
import { UserService } from '../../user/user.service';

@Injectable()
export class MonitorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Monitor)
    private readonly monitorRepository: Repository<Monitor>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private userService: UserService,
  ) {}

  public async getMonitor(reqUserId: number): Promise<Monitor> {
    const monitor = await this.monitorRepository.findOne({
      where: { userOwner: reqUserId },
    });

    if (!monitor) {
      new CustomValidation().notFound(
        'Monitor for user',
        'id',
        reqUserId,
        monitor,
      );
    }

    return monitor;
  }

  public async setMonitor(
    reqUserId: number,
    eventsMonitorDto: EventsMonitorDto,
  ): Promise<IResponseService> {
    const { types, searchRadius, location } = eventsMonitorDto;
    const user = await this.userRepository.findOne(reqUserId);

    this.userService.checkStatusAndUserFound({ user, userId: reqUserId });

    const monitorForDevices = await this.deviceRepository.find({
      where: { userOwner: reqUserId },
    });

    const monitorIsExist = await this.monitorRepository.findOne({
      where: { userOwner: reqUserId },
    });

    if (monitorIsExist) {
      await this.monitorRepository.update(monitorIsExist.id, {
        searchRadius,
        types,
      });

      return new ResponseService().monitorChanged();
    }

    const newMonitor = await this.monitorRepository.save({
      userOwner: user,
      searchRadius,
      types,
    });

    const deviceIds = monitorForDevices.map((device) => device.id);

    if (monitorForDevices.length) {
      await this.deviceRepository.update(deviceIds, {
        monitorForDevice: newMonitor,
        location,
      });
    }

    return new ResponseService().monitorEnabled();
  }

  public async deleteMonitor(reqUserId: number): Promise<IResponseService> {
    const monitor = await this.monitorRepository.findOne({
      where: { userOwner: reqUserId },
    });

    if (!monitor) {
      new CustomValidation().notFound(
        'Monitor for user',
        'id',
        reqUserId,
        monitor,
      );
    }

    const devices = await this.deviceRepository.find({
      where: { userOwner: reqUserId },
    });

    const deviceIds = devices.map((device) => device.id);

    await this.deviceRepository.update(deviceIds, {
      monitorForDevice: null,
    });

    await this.monitorRepository.delete({ id: monitor.id });

    return new ResponseService().monitorDeleted();
  }
}
