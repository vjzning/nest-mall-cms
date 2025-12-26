import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('member/favorite')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post('toggle')
  async toggle(@Req() req, @Body('productId') productId: number) {
    return this.favoriteService.toggleFavorite(req.user.id, productId);
  }

  @Get('list')
  async list(
    @Req() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.favoriteService.getFavorites(req.user.id, page, limit);
  }

  @Get('check')
  async check(@Req() req, @Query('productId') productId: number) {
    const favorited = await this.favoriteService.isFavorite(req.user.id, productId);
    return { favorited };
  }
}
