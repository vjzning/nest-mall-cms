import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberQueryDto, UpdateMemberDto } from './dto/member.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';
import { RequirePermissions } from '../../common/decorators/auth.decorator';

@Controller('mall/member')
@UseInterceptors(LogInterceptor)
export class MemberController {
    constructor(private readonly memberService: MemberService) {}

    @Get()
    @RequirePermissions('mall:member:list')
    findAll(@Query() query: MemberQueryDto) {
        return this.memberService.findAll(query);
    }

    @Get(':id')
    @RequirePermissions('mall:member:query')
    findOne(@Param('id') id: string) {
        return this.memberService.findOne(+id);
    }

    @Put(':id')
    @RequirePermissions('mall:member:update')
    @Log({ module: '会员管理', action: '更新会员' })
    update(@Param('id') id: string, @Body() updateDto: UpdateMemberDto) {
        return this.memberService.update(+id, updateDto);
    }

    @Delete(':id')
    @RequirePermissions('mall:member:delete')
    @Log({ module: '会员管理', action: '删除会员' })
    remove(@Param('id') id: string) {
        return this.memberService.remove(+id);
    }
}
