import { Controller, Get, Param, Delete, UseGuards, Query, Patch, Body } from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';

@Controller('comment')
@UseGuards(AuthGuard('jwt'))
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @RequirePermissions('cms:comment:list')
  findAll(@Query() query: any) {
    return this.commentService.findAll(query);
  }

  @Patch(':id/audit')
  @RequirePermissions('cms:comment:audit')
  audit(@Param('id') id: string, @Body('status') status: number) {
    return this.commentService.audit(+id, status);
  }

  @Delete(':id')
  @RequirePermissions('cms:comment:delete')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
