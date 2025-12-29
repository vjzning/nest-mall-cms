import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LOG_KEY, LogOptions } from '../decorators/log.decorator';
import { LOG_QUEUE, LOG_SAVE_JOB } from '@app/queue';

@Injectable()
export class LogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LogInterceptor.name);

    constructor(
        private reflector: Reflector,
        @InjectQueue(LOG_QUEUE) private logQueue: Queue
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const logOptions = this.reflector.get<LogOptions>(
            LOG_KEY,
            context.getHandler()
        );
        if (!logOptions) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();

        return next.handle().pipe(
            tap((data) => {
                this.saveLog(context, logOptions, startTime, data, 1);
            }),
            catchError((error) => {
                this.saveLog(context, logOptions, startTime, error, 0);
                return throwError(() => error);
            })
        );
    }

    private async saveLog(
        context: ExecutionContext,
        options: LogOptions,
        startTime: number,
        result: any,
        status: number
    ) {
        try {
            const request = context.switchToHttp().getRequest();
            const { method, url, ip, body, query, params, headers } = request;
            const user = request.user;
            const duration = Date.now() - startTime;

            // 简单的敏感字段脱敏
            const sensitiveFields = [
                'password',
                'oldPassword',
                'newPassword',
                'payPassword',
            ];
            const safeBody = { ...body };
            sensitiveFields.forEach((field) => {
                if (safeBody[field]) safeBody[field] = '******';
            });

            // 构造日志数据
            const logData = {
                userId: user?.id,
                userType:
                    user?.type === 'member' || request.url.startsWith('/mall')
                        ? 'member'
                        : 'admin',
                username: user?.username || user?.nickname || 'anonymous',
                module: options.module,
                action: options.action,
                method,
                url,
                ip: (headers['x-forwarded-for'] || ip || '').split(',')[0],
                userAgent: headers['user-agent'],
                params: JSON.stringify({ query, params }),
                body: JSON.stringify(safeBody),
                response:
                    status === 1
                        ? result
                            ? JSON.stringify(result).substring(0, 2000)
                            : ''
                        : '',
                errorMsg:
                    status === 0
                        ? result?.message ||
                          result?.stack ||
                          JSON.stringify(result)
                        : '',
                status,
                duration,
                createdAt: new Date(),
            };
            // 发送到队列异步入库
            await this.logQueue.add(LOG_SAVE_JOB, logData, {
                removeOnComplete: true,
            });
        } catch (err) {
            this.logger.error('Failed to add log to queue', err.stack);
        }
    }
}
