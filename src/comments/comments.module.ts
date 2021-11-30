import { Module } from '@nestjs/common';
import { EventCommentsModule } from './event-comments/event-comments.module';
import { CommentsService } from './comments.service';

@Module({
  imports: [EventCommentsModule],
  providers: [CommentsService],
})
export class CommentsModule {}
