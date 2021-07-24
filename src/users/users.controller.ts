import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('all')
  @ApiCreatedResponse({
    type: User,
  })
  getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  @Get()
  @ApiCreatedResponse({
    type: User,
  })
  getUserByEmail(@Query() email: string): Promise<User> {
    return this.usersService.getUserByEmail(email);
  }

  @Post()
  @ApiCreatedResponse({
    type: User,
  })
  public create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.save(createUserDto);
  }
}
