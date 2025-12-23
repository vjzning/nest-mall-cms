
export class PaginationQueryDto {
  page?: number;

  limit?: number;

  sort?: string;

  order?: 'ASC' | 'DESC';

  [key: string]: any;
}

export class WarningNoticeListQueryDto extends PaginationQueryDto {
  notifyKey?: string;

  status?: number;
}

export class SaveWarningNoticeDto {
  id?: number;

  notifyKey?: string;

  status?: any;

  isNotify?: number;

  notifyType?: any;

  riskValue?: number;

  currentRiskValue?: number;

  currentValue?: number;

  riskValueRate?: number;

  extend?: string;
}
