import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SystemLogEntity } from '@app/db';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SystemLogService {
    private readonly logger = new Logger(SystemLogService.name);

    constructor(
        @InjectRepository(SystemLogEntity)
        private readonly logRepository: Repository<SystemLogEntity>
    ) {}

    async findAll(query: {
        page?: number;
        limit?: number;
        username?: string;
        module?: string;
        status?: number;
        startDate?: string;
        endDate?: string;
    }) {
        const {
            page = 1,
            limit = 10,
            username,
            module,
            status,
            startDate,
            endDate,
        } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (username) where.username = Like(`%${username}%`);
        if (module) where.module = Like(`%${module}%`);
        if (status !== undefined) where.status = status;

        // TODO: Handle date range filtering if needed
        // if (startDate && endDate) {
        //   where.createdAt = Between(new Date(startDate), new Date(endDate));
        // }

        const [items, total] = await this.logRepository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            items,
            total,
            page,
            limit,
        };
    }

    async findOne(id: number) {
        return this.logRepository.findOneBy({ id });
    }

    async removeOldLogs(days: number = 30) {
        const date = new Date();
        date.setDate(date.getDate() - days);

        this.logger.log(`开始清理 ${days} 天前的日志...`);

        // TypeORM delete can take criteria
        const result = await this.logRepository
            .createQueryBuilder()
            .delete()
            .where('createdAt < :date', { date })
            .execute();

        this.logger.log(`清理完成，删除了 ${result.affected} 条日志`);
        return result;
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleLogCleanup() {
        await this.removeOldLogs(30); // 默认保留30天
    }
}
