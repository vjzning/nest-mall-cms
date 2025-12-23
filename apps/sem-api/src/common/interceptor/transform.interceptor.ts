import {
  ExecutionContext,
  CallHandler,
  NestInterceptor,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain } from 'class-transformer';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { DataSource, Repository } from 'typeorm';
import { OperationLogEntity } from '../../entity/operation.log.entity';
import { UserEntity } from '../../entity/user.entity';
import { OperationService } from '../../modules/admin/system/operation/operation.service';
import { NoFormatResponse, OPERATIONLOG } from '../constants/const';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export class TransformInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransformInterceptor.name);
  constructor(
    @Inject(CACHE_MANAGER) protected cacheManager,
    // ... imports
    private dataSource: DataSource,
    private reflector?: Reflector,
  ) { }
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    this.log(req);
    const refData = this.reflector.getAllAndOverride(NoFormatResponse, [
      context.getHandler(),
      context.getClass(),
    ]);
    const ret = this.reflector.getAllAndOverride(OPERATIONLOG, [
      context.getHandler(),
    ]);
    if (ret) {
      const userEntity = new UserEntity();
      userEntity.id = req?.user?.id;
      const opRepository = this.dataSource.getRepository(OperationLogEntity);
      const entity = opRepository.create({
        content: ret[1],
        module: ret[0],
        user: userEntity,
        body: req.body,
      });
      opRepository.save(entity);
    }
    const now = Date.now();
    return next.handle().pipe(
      // catchError(err => throwError(new BadGatewayException())),
      tap(() => {
        const jaeger = req.jaeger;
        if (jaeger) {
          jaeger.finish();
        }
      }),
      map((data) => {
        const jaeger = req.jaeger;
        let traceId;
        if (jaeger) {
          traceId = jaeger.span.context().toTraceId();
        }
        if (refData) return data;
        else if (data?.pageSize && data.list) {
          return {
            data: data.list,
            current: data.page,
            pageSize: data.pageSize,
            total: data.count,
            errorCode: 0,
            success: true,
            traceId,
          };
        } else if (data?.page && data.data) {
          return {
            data: data.data,
            current: data.page,
            // pageSize: data.pageSize,
            total: data.total,
            errorCode: 0,
            success: true,
            traceId,
          };
        } else {
          return {
            data,
            errorCode: 0,
            success: true,
            traceId,
          };
        }
      })
    );
  }
  private log(req): void {
    const body = { ...req.body };
    delete body.password;
    delete body.newPassword1;
    delete body.newPassword2;
    delete body.oldPassword;
    const user = (req as any).user;
    const userEmail = user ? `email:${user.email} - userId:(${user.id})` : null;
    const data = {
      message: '',
      timestamp: new Date().toISOString(),
      method: req.method,
      route: req.route.path,
      data: {
        // body: body,
        query: req.query,
        params: req.params,
      },
      from: req.ip,
      madeBy: userEmail,
    };
    this.logger.log(data, 'HTTP');
  }
}
