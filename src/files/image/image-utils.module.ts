import { Module } from '@nestjs/common';

import { ImageUtilsService } from './image-utils.service';

@Module({
  providers: [ImageUtilsService],
})
export class ImageUtilsModule {}
