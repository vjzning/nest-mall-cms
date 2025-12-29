import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLogEntity } from '@app/db';
import { LOG_QUEUE, LOG_SAVE_JOB } from '@app/queue';

@Processor(LOG_QUEUE)
export class LogProcessor extends WorkerHost {
  private readonly logger = new Logger(LogProcessor.name);

  constructor(
    @InjectRepository(SystemLogEntity)
    private readonly logRepo: Repository<SystemLogEntity>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case LOG_SAVE_JOB:
        return this.handleSaveLog(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleSaveLog(data: any) {
    try {
      const log = this.logRepo.create(data);
      await this.logRepo.save(log);
    } catch (err) {
      this.logger.error('Failed to save system log to database', err.stack);
      throw err;
    }
  }
}
