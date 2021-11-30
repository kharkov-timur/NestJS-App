import { IFile } from '../../interfaces/files.interface';
import { User } from '../../../user/user.entity';
import { Event } from '../../../events/event.entity';
import { Repository } from 'typeorm';
import { File } from '../../files.entity';

export interface CalculateDimensions {
  height: number;
  width: number;
}

export interface FileNameInfo {
  fileName: string;
  fileExt: string;
  isPng: boolean;
  isGif: boolean;
  isHeic: boolean;
  isJpg: boolean;
  isJpeg: boolean;
}

export interface IFileNameGenerator {
  file: IFile;
  relatedUser?: User;
  relatedEvent?: Event;
  fileRepository: Repository<File>;
}
