import {
  Controller,
  Get,
  Request,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IRequest } from '../interfaces/request.interface';
import { User } from './user.entity';
import { PaginatedUsers } from './dto/paginatedUsers.dto';
import { PaginationDto } from '@shared/pagination.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedUsers> {
    return this.userService.getAllUsers(paginationDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  public async getProfile(@Request() req: IRequest): Promise<User> {
    return this.userService.getProfile(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  public async findOne(
    @Request() req: IRequest,
    @Param('id') id: number,
  ): Promise<User> {
    return this.userService.findUser(req.user, id);
  }
}
