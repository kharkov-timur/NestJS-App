import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { Pagination } from 'nestjs-typeorm-paginate';

import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { IResponseService } from '../utils/response-service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { ImageUtilsService } from '../files/image/image-utils.service';
import { IFile } from '../files/interfaces/files.interface';
import { GetUser } from '../components/decorators/get-user.decorator';
import { FilesService } from '../files/files.service';
import { UserHobbiesDto } from './dto/user-hobbies.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly filesService: FilesService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<User>> {
    return this.userService.getAllUsersWithPagination({
      page,
      limit,
      route: `${process.env.BASE_URL}/users`,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  public async findUser(@Param('id') id: number): Promise<User> {
    return this.userService.findUser(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/update/:id')
  public async updateUser(
    @GetUser() userInfo: User,
    @Body() updateUserDto: UpdateUserDto,
    @Headers('authorization') authorization: string,
  ): Promise<User | IResponseService> {
    return this.userService.updateUser(
      userInfo.id,
      updateUserDto,
      authorization,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/hobbies')
  public async userHobbies(
    @GetUser() userInfo: User,
    @Body() userHobbiesDto: UserHobbiesDto,
  ): Promise<User | IResponseService> {
    return this.userService.userHobbies(userInfo.id, userHobbiesDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  public async deleteUser(@Param('id') id: number): Promise<IResponseService> {
    return this.userService.deleteUser(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/avatar/:imgName')
  async getImage(
    @Param('imgName') imgName: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.filesService.getImage(imgName, res);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: process.env.IMG_TEMP,
        filename: ImageUtilsService.customImageFileName,
      }),
      fileFilter: ImageUtilsService.imageFileFilter,
    }),
  )
  @UsePipes(ValidationPipe)
  async uploadUserPhoto(
    @UploadedFile() image: IFile,
    @GetUser() userInfo: User,
  ): Promise<IResponseService> {
    return this.userService.uploadImage(userInfo.id, image);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/avatar/:imageName')
  async deleteAvatar(
    @Param('imageName') imgName: string,
  ): Promise<IResponseService> {
    return this.userService.deleteImage(imgName);
  }
}
