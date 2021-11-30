import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { MonitorService } from './monitor.service';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { EventsMonitorDto } from './dto/events-monitor.dto';
import { GetUser } from '../../components/decorators/get-user.decorator';
import { User } from '../../user/user.entity';
import { Monitor } from './monitor.entity';
import { IResponseService } from '../../utils/response-service';

@ApiTags('Event monitor')
@Controller('events/monitor')
export class MonitorController {
  constructor(private monitorService: MonitorService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getMonitor(@GetUser() userInfo: User): Promise<Monitor> {
    return this.monitorService.getMonitor(userInfo.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async setMonitor(
    @GetUser() userInfo: User,
    @Body() eventsMonitorDto: EventsMonitorDto,
  ): Promise<IResponseService> {
    return this.monitorService.setMonitor(userInfo.id, eventsMonitorDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteMonitor(@GetUser() userInfo: User): Promise<IResponseService> {
    return this.monitorService.deleteMonitor(userInfo.id);
  }
}
