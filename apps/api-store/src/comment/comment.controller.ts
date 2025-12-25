import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('article/:articleId')
  findByArticle(@Param('articleId') articleId: string, @Query() query: any) {
    return this.commentService.findByArticle(+articleId, query);
  }

  @Post()
  create(@Body() createCommentDto: any) {
    return this.commentService.create(createCommentDto);
  }
}
