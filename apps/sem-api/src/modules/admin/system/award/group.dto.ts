

export class PaginationQueryDto {

  
  page?: () => number;


  
  limit?: () => number;


  
  sort?: () => string;


  
  order?: 'ASC' | 'DESC';

  [key: string]: any;
}

export class AwardGroupListQueryDto extends  PaginationQueryDto {

  
  name?: () => string;


  
  isDel?: () => boolean;
}

export class SaveAwardGroupDto {

  
  id?: () => number;


  
  name?: () => string;


  
  image?: () => string;


  
  description?: () => string;


  
  probLevelAwards?: () => any[];
}
