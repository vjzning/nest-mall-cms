

export class ResponseDto {

  errorCode: number;

  message: string;

  data?: any;

  current?: number;

  total?: number;

  pageSize?: number;
}

export class TableListParams {

  status?: string;

  name?: string;

  pageSize?: number;

  // currentPage?: number;
  current?: number;

  filter?: Record<string, any>;

  sorter?: Record<string, any>;
}

export class BaseTableListParams {

  create_at?: [string, string] | string;

  keyword?: string;

  name?: string;

  status?: string;

  pageSize?: number = 20;

  current?: number = 1;

  filter?: Record<string, any>;

  sorter?: Record<string, any>;
}
export class RouterDto {
  path?: string;
  method?: string;
  desc?: string;
}

export class LableInfo {
  // label: string;
  value: any;
  name: string;
}
export class IndicatorDto {
  id: number;
  params: [LableInfo];
}
