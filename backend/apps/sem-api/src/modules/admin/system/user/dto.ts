

export class PaginationQueryDto {

  page?: number;


  limit?: number;


  sort?: string;


  order?: 'ASC' | 'DESC';

  [key: string]: any;
}

export class BusinessUserListQueryDto extends PaginationQueryDto {

  businessUserId?: number;


  projectId?: number;


  nickname?: string;
}

export class SaveBusinessUserDto {

  id?: number;


  businessUserId?: number;


  projectId?: number;


  avatar?: string;


  nickname?: string;


  extAttr?: any;
}

export class TagRuleListQueryDto extends PaginationQueryDto {

  name?: string;


  title?: string;


  isOnline?: boolean;
}

export class SaveTagRuleDto {

  id?: number;


  title?: string;


  name?: string;


  ruleConfig?: string;


  timeZone?: any;


  analyseTarget?: any;


  operatorState?: number;


  extAttr?: any;


  isOnline?: boolean;


  remark?: string;
}

export class UserTagMapListQueryDto extends PaginationQueryDto {

  userId?: number;


  tagId?: number;


  status?: number;
}

export class SaveUserTagMapDto {

  id?: number;


  tag?: { id: number };


  user?: { id: number; businessUserId: number };


  startTime?: any;


  endTime?: any;


  status?: number;


  extAttr?: any;
}
