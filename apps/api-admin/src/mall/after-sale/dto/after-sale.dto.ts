import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsNumber,
    IsDecimal,
} from 'class-validator';
import { AfterSaleStatus } from '@app/db/entities/mall-after-sale.entity';
import { Type } from 'class-transformer';

export class QueryAfterSaleDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsEnum(AfterSaleStatus)
    status?: AfterSaleStatus;

    @IsOptional()
    @IsString()
    afterSaleNo?: string;

    @IsOptional()
    @IsString()
    orderNo?: string;
}

export class AuditAfterSaleDto {
    @IsEnum([AfterSaleStatus.APPROVED, AfterSaleStatus.REJECTED])
    status: AfterSaleStatus;

    @IsOptional()
    @IsString()
    adminRemark?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    actualAmount?: number;
}

export class ResendLogisticsDto {
    @IsString()
    trackingNo: string;

    @IsString()
    carrier: string;
}
