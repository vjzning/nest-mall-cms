

export class PaginationQueryDto {

  page?: number;


  limit?: number;


  sort?: string;


  order?: 'ASC' | 'DESC';

  [key: string]: any;
}

export class DataSourceListQueryDto extends PaginationQueryDto {

  name?: string;


  type?: string;
}

export class SaveDataSourceDto {

  id?: number;


  name?: string;


  type?: string;


  config?: string;


  description?: string;
}

export class RuleConfigListQueryDto extends PaginationQueryDto {

  name?: string;


  type?: string;


  sourceId?: number;
}

export class SaveRuleConfigDto {

  id?: number;


  name?: string;


  type?: string;


  config?: string;


  description?: string;


  source?: { id: number };


  sourceId?: number;
}
