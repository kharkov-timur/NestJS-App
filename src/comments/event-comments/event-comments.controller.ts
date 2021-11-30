import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { EventCommentsService } from './event-comments.service';
import { GetUser } from '../../components/decorators/get-user.decorator';
import { User } from '../../user/user.entity';
import { CreateEventCommentsDto } from '../dto/create-event-comments.dto';
import { UpdateEventCommentsDto } from '../dto/update-event-comments.dto';
import { EventComments } from './event-comments.entity';
import { IResponseService } from '../../utils/response-service';
import { DeleteEventCommentsDto } from '../dto/delete-event-comments.dto';

@ApiTags('Event comments')
@Controller('event/comments')
export class EventCommentsController {
  constructor(private eventCommentsService: EventCommentsService) {}

  @ApiOperation({ summary: 'Get all comments for event' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/all-comments/:eventId')
  async getAllCommentsForEvent(
    @GetUser() userInfo: User,
    @Param('eventId') eventId: number,
  ): Promise<EventComments[]> {
    return this.eventCommentsService.getAllComments(userInfo.id, eventId);
  }

  @ApiOperation({ summary: 'Get one comment for event' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/one-comment/:commentId')
  async getOneComment(
    @GetUser() userInfo: User,
    @Param('commentId') commentId: number,
  ): Promise<EventComments> {
    return this.eventCommentsService.getOneComment(userInfo.id, commentId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async createComment(
    @GetUser() userInfo: User,
    @Body() eventCommentsDto: CreateEventCommentsDto,
  ): Promise<EventComments> {
    return this.eventCommentsService.createComment(
      userInfo.id,
      eventCommentsDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/update/:commentId')
  async updateComment(
    @GetUser() userInfo: User,
    @Param('commentId') commentId: number,
    @Body() updateEventCommentsDto: UpdateEventCommentsDto,
  ): Promise<EventComments> {
    return this.eventCommentsService.updateComment(
      userInfo.id,
      commentId,
      updateEventCommentsDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:commentId')
  async deleteComment(
    @GetUser() userInfo: User,
    @Param('commentId') commentId: number,
    @Body() deleteEventCommentsDto: DeleteEventCommentsDto,
  ): Promise<IResponseService> {
    return this.eventCommentsService.deleteComment(
      userInfo.id,
      commentId,
      deleteEventCommentsDto,
    );
  }
}
