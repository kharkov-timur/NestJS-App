import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesService } from './files.service';
import { File } from './files.entity';
import { ImageUtilsService } from './image/image-utils.service';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  exports: [FilesService],
  providers: [FilesService, ImageUtilsService],
})
export class FilesModule {}
