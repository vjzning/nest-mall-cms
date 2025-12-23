

export class SaveCategoryDto {
  id?: number;

  name?: string;

  parent?: SaveCategoryDto;

  batch?: SaveCategoryDto[];
}

export class SaveTaskDto {

  name?: string;

  category?: [];

  key_id?: string;

  custom_param: { name: string; value: string }[];

  href_params?: string;
}
