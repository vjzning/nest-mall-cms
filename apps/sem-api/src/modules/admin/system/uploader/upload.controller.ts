import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';
import * as path from 'path';
import * as md5 from 'blueimp-md5';
import { nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
@Controller('uploader')
export class UploaderController {
  constructor(
    private readonly utils: Utils,
    private readonly configService: ConfigService
  ) {}
  @Post('/s3')
  @UseInterceptors(FileInterceptor('file'))
  async uploadS3(@UploadedFile() file) {
    // return;
    const s3 = new AWS.S3();
    s3.config = this.utils.getAWSConfig();
    // await s3.createBucket({ Bucket: 'sem-activity' }).promise();
    //获取文件后缀名
    const ext = path.extname(file.originalname);
    const result = await s3
      .upload({
        Bucket: this.configService.get('S3Bucket'),
        Key: nanoid() + ext,
        Body: file.buffer,
        ACL: 'public-read',
      })
      .promise();
    return { url: result.Location };
  }
}
