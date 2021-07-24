import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './role.entity';
import { RoleService } from './role.service';
import { IMessage } from '../../interfaces/message.interface';
import { AdminJwtAuthGuard } from '../../auth/admin/admin.guard';

@ApiTags('Role')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  public async all(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard)
  public async findOne(@Param('id') id: number): Promise<Role> {
    return this.roleService.findById(id);
  }

  @Post(':id')
  @UseGuards(AdminJwtAuthGuard)
  public update(
    @Param('id') id: number,
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<Role> {
    return this.roleService.updateRoleById(id, createRoleDto);
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard)
  public delete(@Param('id') id: number): Promise<IMessage> {
    return this.roleService.deleteById(id);
  }
}
