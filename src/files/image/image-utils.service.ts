import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as path from 'path';
import { v4 as uuidV4 } from 'uuid';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as heicConvert from 'heic-convert';
import * as BlueBird from 'bluebird';
import { Storage } from '@google-cloud/storage';

import { IFile } from '../interfaces/files.interface';
import {
  CalculateDimensions,
  FileNameInfo,
  IFileNameGenerator,
} from './interfaces/image.interface';
import { cropperEnum } from './enums/cropper.enum';
import {
  IResponseService,
  ResponseService,
} from '../../utils/response-service';
import { CustomValidation } from '../../utils/custom-validation';

@Injectable()
export class ImageUtilsService {
  googleStorage = new Storage({
    keyFilename: path.join(__dirname, './google-storage.json'),
    projectId: process.env.GOOGLE_BUCKET_ID,
  });

  bucket = this.googleStorage.bucket(process.env.GOOGLE_BUCKET_NAME);

  public static imageFileFilter(
    req: Request,
    file: IFile,
    callback: CallableFunction,
  ): void {
    const fileExt = file.originalname.split('.')[1];
    const chekExt = fileExt
      ? file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif|heic)$/)
      : file.mimetype.match(/\/(jpg|jpeg|png|gif|heic)$/);

    if (!chekExt) {
      callback(
        new BadRequestException(
          'Only image files can be downloaded .jpg, .jpeg, .png, .gif, .heic',
        ),
        false,
      );
    }

    callback(null, true);
  }

  public static customImageFileName(
    req: Request,
    file: IFile,
    callback: CallableFunction,
  ): void {
    const checkExt = file.originalname.split('.')[1];

    const fileExt = checkExt
      ? file.originalname.split('.')[1]
      : file.mimetype.split('/')[1];

    const fileName = file.originalname.split('.')[0];
    const newFileName = `${fileName}-${uuidV4()}.${fileExt.toLowerCase()}`;

    callback(null, newFileName);
  }

  private static calculateDimensions(
    dimensions: CalculateDimensions,
    cropper: keyof typeof cropperEnum,
  ): CalculateDimensions {
    const heightSizes = {
      SMALL: 200,
      MEDIUM: 800,
    };

    const isPortrait = dimensions.width < dimensions.height;
    const proportion = isPortrait
      ? +(dimensions.height / dimensions.width).toFixed(2)
      : +(dimensions.width / dimensions.height).toFixed(2);

    const height = heightSizes[cropper];
    const width = isPortrait
      ? Math.round(height / proportion)
      : Math.round(height * proportion);

    return { width, height };
  }

  async heicToJpg(tempImgPath: string): Promise<Buffer> {
    const inputBuffer = await fs.promises.readFile(tempImgPath);

    return heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.6,
    });
  }

  public async imageOptimize(
    file: IFile,
    storageDir: string = path.resolve(process.env.IMG_PATH),
  ): Promise<sharp.OutputInfo | void> {
    sharp.cache(false);

    const { fileName, fileExt, isPng, isGif, isHeic, isJpg, isJpeg } =
      this.getFileName(file);
    const tempImgPath = `${process.env.IMG_TEMP}/${file.filename}`;
    const metaData = await sharp(tempImgPath).metadata();
    const dimensions = { height: metaData.height, width: metaData.width };

    if (isHeic) {
      const outputBuffer = await this.heicToJpg(tempImgPath);

      try {
        await fs.promises.writeFile(
          `${storageDir}/${fileName}.jpeg`,
          outputBuffer,
        );
      } catch (error) {
        await fs.promises.unlink(tempImgPath);
        return console.error;
      }
    }

    if (isJpeg || isJpg) {
      try {
        await sharp(tempImgPath, { failOnerror: false })
          .jpeg({ quality: 70 })
          .toFile(`${storageDir}/${file.filename}`);
      } catch (error) {
        await fs.promises.unlink(tempImgPath);
        return console.error;
      }
    }

    if (isPng) {
      try {
        await sharp(tempImgPath, { failOnError: false })
          .flatten({ background: { r: 255, g: 255, b: 255 } })
          .toFormat('jpeg')
          .jpeg({ quality: 70 })
          .toFile(`${storageDir}/${fileName}.jpeg`);
      } catch (error) {
        await fs.promises.unlink(tempImgPath);
        return console.error;
      }
    }

    if (isGif) {
      const imgFile = await fs.promises.readFile(tempImgPath);

      try {
        await fs.promises.writeFile(`${storageDir}/${file.filename}`, imgFile);
        await fs.promises.writeFile(
          `${storageDir}/cropped-${file.filename}`,
          imgFile,
        );
        return fs.promises.unlink(tempImgPath);
      } catch (error) {
        await fs.promises.unlink(tempImgPath);
        return console.error;
      }
    }

    const { width, height } = ImageUtilsService.calculateDimensions(
      dimensions,
      'SMALL',
    );

    const optimizedExt = isPng || isHeic ? 'jpeg' : fileExt;
    const optimizedFileName = `${fileName}.${optimizedExt}`;

    await sharp(`${storageDir}/${optimizedFileName}`, {
      failOnError: false,
    })
      .resize({
        width: width,
        height: height,
      })
      .toFile(`${storageDir}/cropped-${optimizedFileName}`);

    return fs.promises.unlink(tempImgPath);
  }

  public getFileName(file: IFile): FileNameInfo {
    return {
      fileName: file.filename.split('.')[0],
      fileExt: file.filename.split('.')[1],
      isPng: file.filename.split('.')[1] === 'png',
      isGif: file.filename.split('.')[1] === 'gif',
      isHeic: file.filename.split('.')[1] === 'heic',
      isJpg: file.filename.split('.')[1] === 'jpg',
      isJpeg: file.filename.split('.')[1] === 'jpeg',
    };
  }

  public async imageProcessor(
    files: IFile[],
    storageDir: string = path.resolve(process.env.IMG_PATH),
  ): Promise<(sharp.OutputInfo | void)[]> {
    const promises = files.map((file) => this.imageOptimize(file, storageDir));

    return Promise.all(promises);
  }

  public async imagesRemover(fileNames: string[]): Promise<IResponseService> {
    const promises: Promise<any>[] = [];

    fileNames.forEach((fileName) => {
      if (!fileName.includes('https') || !fileName.includes('http')) {
        const filePath = path.resolve(`${process.env.IMG_PATH}/${fileName}`);
        promises.push(fs.promises.unlink(filePath));
      }
    });

    await Promise.all(promises);
    return new ResponseService().deleteImageSuccess(fileNames.join(', '));
  }

  public async fileNameGenerator({
    file,
    relatedUser,
    relatedEvent,
    fileRepository,
  }: IFileNameGenerator) {
    await this.imageOptimize(file);

    const { fileName, isPng, isHeic } = this.getFileName(file);
    const original = await fileRepository.save({
      name: isPng || isHeic ? `${fileName}.jpeg` : file.filename,
      user: relatedUser ? relatedUser : null,
      event: relatedEvent ? relatedEvent : null,
    });

    const cropped = await fileRepository.save({
      name:
        isPng || isHeic
          ? `cropped-${fileName}.jpeg`
          : `cropped-${file.filename}`,
      user: relatedUser ? relatedUser : null,
      event: relatedEvent ? relatedEvent : null,
    });

    return { original, cropped };
  }

  public async uploadToGoogleStorage(fileNames: string[]) {
    try {
      if (process.env.NODE_ENV !== 'local') {
        await BlueBird.map(
          fileNames,
          (fileName) => {
            const filePath = `${process.env.IMG_PATH}/${fileName}`;

            return this.bucket.upload(path.resolve(filePath), {
              destination: `${process.env.GOOGLE_STORAGE_PATH}/${fileName}`,
            });
          },
          { concurrency: 1 },
        );
        await this.imagesRemover(fileNames);
      }
    } catch (error) {
      new CustomValidation().failedLoadFile(error);
    }
  }

  public async deleteFromGoogleStorage(fileNames: string[]) {
    try {
      await BlueBird.map(
        fileNames,
        async (fileName) => {
          await this.bucket
            .file(`${process.env.GOOGLE_STORAGE_PATH}/${fileName}`)
            .delete()
            .catch(console.error);
        },
        { concurrency: 10 },
      );
    } catch (error) {
      new CustomValidation().failedDeleteFile(error);
    }
  }
}
