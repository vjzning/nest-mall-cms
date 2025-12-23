import {
  ExceptionFilter,
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ErrorCode } from '../constants/error';
@Catch()
export class MyHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger();
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    let message;
    let errorCode;
    let status;
    if (exception.getStatus) {
      //http exception
      const exceResponse: any = exception.getResponse();
      errorCode = exceResponse.statusCode;
      message = ErrorCode.CodeToMessage(errorCode);
      if (!message) {
        if (Array.isArray(exceResponse.message)) {
          message = exceResponse.message.join(',');
        } else if (exceResponse.message) {
          message = exceResponse.message;
        }
      }
      this.logger.error({
        message: [message, exception.message].join('\n'),
      });
      status = exception.getStatus();
    } else {
      //其他异常
      // console.error('cus exception', exception['code'], exception['errno']);
      errorCode = ErrorCode.ERROR.CODE;
      message = exception['code'];
      this.logger.error(exception);
      status = 500;
    }
    const jaeger = req?.jaeger;
    let traceId;
    if (jaeger) {
      traceId = jaeger.span.context().toTraceId();
    }
    res.status(status).json({
      errorCode: errorCode,
      errorMessage: message,
      success: false,
      traceId,
    });
  }
}
