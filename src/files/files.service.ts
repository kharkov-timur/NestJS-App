import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import * as fs from 'fs';

import { CustomValidation } from '../utils/custom-validation';
import { File } from './files.entity';
import { Repository } from 'typeorm';
import { ImageUtilsService } from './image/image-utils.service';
import { IResponseService, ResponseService } from '../utils/response-service';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private imageUtilsService: ImageUtilsService,
  ) {}

  public async getImage(imgName: string, res: Response): Promise<void> {
    try {
      await fs.promises.access(`${process.env.IMG_PATH}/${imgName}`);
      return res.sendFile(imgName, { root: process.env.IMG_PATH });
    } catch (error) {
      new CustomValidation().fileIsNotFound(imgName);
    }
  }

  public async deleteImage(imgNames: string[]): Promise<IResponseService> {
    try {
      process.env.NODE_ENV !== 'local'
        ? await this.imageUtilsService.deleteFromGoogleStorage(imgNames)
        : await this.imageUtilsService.imagesRemover(imgNames);

      for (const imgName of imgNames) {
        const query = this.fileRepository.createQueryBuilder('files');
        await query.delete().where('name = :name', { name: imgName }).execute();
      }

      return new ResponseService().deleteImageSuccess(imgNames.join(', '));
    } catch (error) {
      new CustomValidation().fileIsNotFound(imgNames.join(', '));
    }
  }
}
