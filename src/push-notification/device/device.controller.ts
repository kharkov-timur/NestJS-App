import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { DeviceService } from './device.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { IResponseService } from '../../utils/response-service';
import { GetUser } from '../../components/decorators/get-user.decorator';
import { User } from '../../user/user.entity';
import { IDevice } from './interfaces/device.interface';

@ApiTags('Device')
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserDevices(@GetUser() userInfo: User): Promise<IDevice[]> {
    return this.deviceService.getDevices(userInfo.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/:deviceId')
  async deleteDevice(
    @GetUser() userInfo: User,
    @Param('deviceId') deviceId: string,
  ): Promise<IResponseService> {
    return this.deviceService.deleteDevice(userInfo.id, deviceId);
  }
}
