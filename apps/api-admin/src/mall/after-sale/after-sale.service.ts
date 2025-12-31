import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    MallAfterSaleEntity,
    AfterSaleStatus,
} from '@app/db/entities/mall-after-sale.entity';
import {
    MallOrderEntity,
    OrderStatus,
} from '@app/db/entities/mall-order.entity';
import { PaymentService } from '@app/payment';
import {
    QueryAfterSaleDto,
    AuditAfterSaleDto,
    ResendLogisticsDto,
} from './dto/after-sale.dto';
import {
    MallAfterSaleLogisticsEntity,
    AfterSaleLogisticsType,
} from '@app/db/entities/mall-after-sale-logistics.entity';
import { MallPaymentEntity } from '@app/db/entities/mall-payment.entity';

@Injectable()
export class AfterSaleService {
    constructor(
        @InjectRepository(MallAfterSaleEntity)
        private readonly afterSaleRepo: Repository<MallAfterSaleEntity>,
        @InjectRepository(MallOrderEntity)
        private readonly orderRepo: Repository<MallOrderEntity>,
        @InjectRepository(MallAfterSaleLogisticsEntity)
        private readonly logisticsRepo: Repository<MallAfterSaleLogisticsEntity>,
        @InjectRepository(MallPaymentEntity)
        private readonly paymentRepo: Repository<MallPaymentEntity>,
        private readonly paymentService: PaymentService
    ) {}

    async list(query: QueryAfterSaleDto) {
        const { page = 1, limit = 10, status, afterSaleNo, orderNo } = query;
        const qb = this.afterSaleRepo
            .createQueryBuilder('as')
            .leftJoinAndSelect('as.member', 'member')
            .leftJoinAndSelect('as.items', 'items')
            .orderBy('as.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (status) {
            qb.andWhere('as.status = :status', { status });
        }
        if (afterSaleNo) {
            qb.andWhere('as.afterSaleNo LIKE :afterSaleNo', {
                afterSaleNo: `%${afterSaleNo}%`,
            });
        }
        if (orderNo) {
            qb.andWhere('as.orderNo LIKE :orderNo', {
                orderNo: `%${orderNo}%`,
            });
        }

        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }

    async detail(id: number) {
        const afterSale = await this.afterSaleRepo.findOne({
            where: { id },
            relations: [
                'member',
                'items',
                'items.orderItem',
                'order',
                'order.items',
            ],
        });

        if (!afterSale) {
            throw new NotFoundException('售后单不存在');
        }

        const logistics = await this.logisticsRepo.find({
            where: { afterSaleId: id },
        });

        return { ...afterSale, logistics };
    }

    async audit(id: number, dto: AuditAfterSaleDto) {
        const afterSale = await this.afterSaleRepo.findOne({
            where: { id },
            relations: ['order'],
        });

        if (!afterSale) {
            throw new NotFoundException('售后单不存在');
        }

        if (afterSale.status !== AfterSaleStatus.APPLIED) {
            throw new BadRequestException('当前状态不可审核');
        }

        afterSale.status = dto.status;
        if (dto.adminRemark) {
            afterSale.adminRemark = dto.adminRemark;
        }
        afterSale.handleTime = new Date();

        if (dto.status === AfterSaleStatus.APPROVED && dto.actualAmount) {
            afterSale.actualAmount = dto.actualAmount;
        }

        // 如果是仅退款且审核通过，直接触发退款逻辑
        if (afterSale.type === 1 && dto.status === AfterSaleStatus.APPROVED) {
            await this.executeRefund(afterSale);
        }

        return this.afterSaleRepo.save(afterSale);
    }

    async executeRefund(afterSale: MallAfterSaleEntity) {
        const order = afterSale.order;
        if (!order.transactionId) {
            throw new BadRequestException('订单未支付，无法退款');
        }

        // 获取订单支付信息以确定支付渠道
        const payment = await this.paymentRepo.findOne({
            where: { orderNo: order.orderNo },
        });

        if (!payment) {
            throw new BadRequestException('支付记录不存在');
        }

        try {
            await this.paymentService.refund(
                payment.paymentMethod,
                order.transactionId,
                Number(afterSale.actualAmount || afterSale.applyAmount),
                afterSale.applyReason
            );

            afterSale.status = AfterSaleStatus.REFUNDED;
            await this.afterSaleRepo.save(afterSale);

            // 如果售后申请的金额等于订单支付金额（全额退款），则取消订单
            const refundAmount = Number(
                afterSale.actualAmount || afterSale.applyAmount
            );
            if (refundAmount >= Number(order.payAmount)) {
                order.status = OrderStatus.CANCELLED;
                await this.orderRepo.save(order);
            }
        } catch (error) {
            throw new BadRequestException(`退款执行失败: ${error.message}`);
        }
    }

    async confirmReceipt(id: number) {
        const afterSale = await this.afterSaleRepo.findOne({ where: { id } });
        if (!afterSale) throw new NotFoundException('售后单不存在');

        if (afterSale.status !== AfterSaleStatus.WAITING_RECEIPT) {
            throw new BadRequestException('当前状态不可确认收货');
        }

        afterSale.status = AfterSaleStatus.PROCESSING;

        // 如果是退货退款，确认收货后进入退款阶段
        if (afterSale.type === 2) {
            await this.executeRefund(afterSale);
        }

        return this.afterSaleRepo.save(afterSale);
    }

    async resendLogistics(id: number, dto: ResendLogisticsDto) {
        const afterSale = await this.afterSaleRepo.findOne({ where: { id } });
        if (!afterSale) throw new NotFoundException('售后单不存在');

        if (
            afterSale.type !== 3 ||
            afterSale.status !== AfterSaleStatus.PROCESSING
        ) {
            throw new BadRequestException('只有换货中的订单可填补发物流');
        }

        const logistics = this.logisticsRepo.create({
            afterSaleId: id,
            type: AfterSaleLogisticsType.MERCHANT_RESEND,
            trackingNo: dto.trackingNo,
            carrier: dto.carrier,
        });

        await this.logisticsRepo.save(logistics);

        afterSale.status = AfterSaleStatus.COMPLETED;
        return this.afterSaleRepo.save(afterSale);
    }
}
