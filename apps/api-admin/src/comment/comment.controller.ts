import {
    Controller,
    Get,
    Param,
    Delete,
    UseGuards,
    Query,
    Patch,
    Body,
    UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('comment')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LogInterceptor)
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Get()
    @RequirePermissions('cms:comment:list')
    findAll(@Query() query: any) {
        return this.commentService.findAll(query);
    }

    @Patch(':id/audit')
    @RequirePermissions('cms:comment:audit')
    @Log({ module: '评论管理', action: '审核评论' })
    audit(@Param('id') id: string, @Body('status') status: number) {
        return this.commentService.audit(+id, status);
    }

    @Delete(':id')
    @RequirePermissions('cms:comment:delete')
    @Log({ module: '评论管理', action: '删除评论' })
    remove(@Param('id') id: string) {
        return this.commentService.remove(+id);
    }
}
