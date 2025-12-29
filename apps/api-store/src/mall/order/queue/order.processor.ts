import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OrderService } from '../order.service';
import { ORDER_QUEUE, ORDER_TIMEOUT_JOB, ORDER_AUTO_CONFIRM_JOB } from '@app/queue';
import { OrderStatus } from '@app/db/entities/mall-order.entity';

@Processor(ORDER_QUEUE)
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(private readonly orderService: OrderService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case ORDER_TIMEOUT_JOB:
        return this.handleOrderTimeout(job.data.orderId);
      case ORDER_AUTO_CONFIRM_JOB:
        return this.handleAutoConfirm(job.data.orderId);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleOrderTimeout(orderId: number) {
    this.logger.log(`Checking timeout for order: ${orderId}`);
    try {
        const order = await (this.orderService as any).orderRepo.findOne({ 
            where: { id: orderId } 
        });

        if (order && order.status === OrderStatus.PENDING_PAY) {
            this.logger.log(`Order ${orderId} timed out. Cancelling...`);
            await this.orderService.cancel(orderId, Number(order.memberId));
            this.logger.log(`Order ${orderId} cancelled by system timeout.`);
        }
    } catch (err) {
        this.logger.error(`Failed to handle timeout for order ${orderId}`, err.stack);
        throw err;
    }
  }

  private async handleAutoConfirm(orderId: number) {
    this.logger.log(`System auto-confirming order: ${orderId}`);
    try {
      await this.orderService.confirmReceipt(orderId);
      this.logger.log(`Order ${orderId} auto-confirmed by system.`);
    } catch (err) {
      this.logger.error(`Failed to auto-confirm order ${orderId}`, err.stack);
      throw err;
    }
  }
}
