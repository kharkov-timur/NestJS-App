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
import { IRequest } from '../interfaces/request.interface';
import { User } from './user.entity';
import { PaginatedUsers } from './dto/paginatedUsers.dto';
import { PaginationDto } from '@shared/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  // @Query() paginationDto: PaginationDto,
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  public async findOne(
    @Request() req: IRequest,
    @Param('id') id: number,
  ): Promise<User> {
    return this.userService.findUser(req.user.id);
  }
}
