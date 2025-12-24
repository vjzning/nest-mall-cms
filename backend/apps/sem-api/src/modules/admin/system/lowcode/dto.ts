

export class PaginationQueryDto {

  page?: number;


  limit?: number;


  sort?: string;


  order?: 'ASC' | 'DESC';

  [key: string]: any;
}

export class LowcodePageListQueryDto extends PaginationQueryDto {

  activityId?: number;


  title?: string;


  uuid?: string;
}

export class SaveLowcodePageDto {

  id?: number;


  uuid?: string;


  title?: string;


  schema?: any;


  isHome?: number;


  activity?: { id: number };


  activityId?: number;
}

export class SaveSchemaDto {

  uuid: string;


  schema: any;
}

export class GetSchemaQueryDto {

  uuid: string;
}

export class PublishQueryDto {

  uuid: string;
}

export class SetHomeDto {

  uuid: string;
}

export class LowcodeBlockListQueryDto extends PaginationQueryDto {

  name?: string;


  title?: string;
}

export class SaveLowcodeBlockDto {

  id?: number;


  name?: string;


  title?: string;


  schema?: any;


  screenshot?: string;
}

export class SavePageDto {

  uuid: string;
}
