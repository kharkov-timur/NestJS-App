import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

import { EventsService } from './events.service';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UpdateEventDto } from './dto/update-event.dto';
import { IResponseService } from 'src/utils/response-service';
import { GetUser } from 'src/components/decorators/get-user.decorator';
import { User } from 'src/user/user.entity';
import { ImageUtilsService } from '../files/image/image-utils.service';
import { IFile } from '../files/interfaces/files.interface';
import { ChangeMainImgDto } from './dto/change-main-img.dto';
import { UploadImageDto } from './dto/upload-image.dto';

@ApiTags('Event')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiQuery({
    description: 'Support pagination',
    example: 'events?page=2&limit=5',
  })
  @Get()
  async getAllEvents(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 20,
  ): Promise<Pagination<Event>> {
    limit = limit > 100 ? 100 : limit;
    return this.eventsService.getAllEventsWithPaginate({
      page,
      limit,
      route: `${process.env.BASE_URL}/events`,
    });
  }

  @ApiQuery({
    description: 'Support pagination',
    example: 'events/past?page=2&limit=5',
  })
  @Get('/past')
  async pastEvents(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<Event>> {
    limit = limit > 100 ? 100 : limit;
    return this.eventsService.pastEvents({
      page,
      limit,
      route: `${process.env.BASE_URL}/events/past`,
    });
  }

  @Get('/:eventId')
  async getEventById(
    @Param('eventId') id: number,
  ): Promise<Event | HttpException | void> {
    return this.eventsService.getEventById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async createEvent(
    @GetUser() userInfo: User,
    @Body() createEventDto: CreateEventDto,
  ): Promise<Event> {
    return this.eventsService.createNewEvent(userInfo.id, createEventDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/update/:eventId')
  async updateEvent(
    @GetUser() userInfo: User,
    @Param('eventId') id: number,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsService.updateEvent(userInfo, id, updateEventDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:eventId')
  async deleteEvent(
    @GetUser() userInfo: User,
    @Param('eventId') eventId: number,
  ): Promise<IResponseService> {
    return this.eventsService.deleteEvent(userInfo.id, eventId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        eventId: { type: 'number' },
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
        destination: path.resolve(process.env.IMG_TEMP),
        filename: ImageUtilsService.customImageFileName,
      }),
      fileFilter: ImageUtilsService.imageFileFilter,
    }),
  )
  @UsePipes(ValidationPipe)
  async uploadEventPhoto(
    @GetUser() userInfo: User,
    @UploadedFile() file: IFile,
    @Body() uploadImageDto: UploadImageDto,
  ): Promise<IResponseService> {
    return this.eventsService.uploadImage(userInfo.id, file, uploadImageDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/image/multiple')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        eventId: { type: 'number' },
        images: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('images', 15, {
      storage: diskStorage({
        destination: path.resolve(process.env.IMG_TEMP),
        filename: ImageUtilsService.customImageFileName,
      }),
      fileFilter: ImageUtilsService.imageFileFilter,
    }),
  )
  @UsePipes(ValidationPipe)
  async uploadMultiplePhotos(
    @GetUser() userInfo: User,
    @UploadedFiles() files: IFile[],
    @Body() uploadImageDto: UploadImageDto,
  ): Promise<IResponseService> {
    return this.eventsService.uploadMultipleImage(
      userInfo.id,
      files,
      uploadImageDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/image/:imageName')
  async deleteImageFile(
    @Query('eventId') eventId: number,
    @Param('imageName') imgName: string,
  ): Promise<IResponseService> {
    return this.eventsService.deleteImageFile(eventId, imgName);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/image/preview')
  @UsePipes(ValidationPipe)
  async changePreviewImage(
    @Body() changeMainImgDto: ChangeMainImgDto,
  ): Promise<Event> {
    return this.eventsService.changePreviewImage(changeMainImgDto);
  }
}
