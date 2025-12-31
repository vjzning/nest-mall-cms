import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { ShippingTemplateService } from './shipping-template.service';
import { CreateShippingTemplateDto } from './dto/create-shipping-template.dto';
import { UpdateShippingTemplateDto } from './dto/update-shipping-template.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('mall/shipping-templates')
@UseInterceptors(LogInterceptor)
export class ShippingTemplateController {
    constructor(
        private readonly shippingTemplateService: ShippingTemplateService
    ) {}

    @Post()
    @Log({ module: '运费模板', action: '创建模板' })
    create(@Body() createDto: CreateShippingTemplateDto) {
        return this.shippingTemplateService.create(createDto);
    }

    @Get()
    findAll(@Query() query: { page?: number; pageSize?: number }) {
        return this.shippingTemplateService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.shippingTemplateService.findOne(+id);
    }

    @Patch(':id')
    @Log({ module: '运费模板', action: '修改模板' })
    update(
        @Param('id') id: string,
        @Body() updateDto: UpdateShippingTemplateDto
    ) {
        return this.shippingTemplateService.update(+id, updateDto);
    }

    @Delete(':id')
    @Log({ module: '运费模板', action: '删除模板' })
    remove(@Param('id') id: string) {
        return this.shippingTemplateService.remove(+id);
    }
}
