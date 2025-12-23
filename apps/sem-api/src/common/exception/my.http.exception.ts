import { HttpStatus, HttpException } from '@nestjs/common';
import { ErrorCode } from '../constants/error';

class MyHttpExceptionData {
  statusCode?: number;
  message?: string;
}

export class MyHttpException extends HttpException {
  constructor(expData: MyHttpExceptionData) {
    if (typeof expData.statusCode === 'undefined') {
      expData.statusCode = ErrorCode.ParamsError.CODE;
    }
    super(expData, HttpStatus.OK);
  }
}
