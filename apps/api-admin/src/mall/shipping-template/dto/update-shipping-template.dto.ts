import { PartialType } from '@nestjs/mapped-types';
import { CreateShippingTemplateDto } from './create-shipping-template.dto';

export class UpdateShippingTemplateDto extends PartialType(CreateShippingTemplateDto) {}
