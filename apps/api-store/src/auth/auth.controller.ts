import {
    Controller,
    Post,
    Get,
    Put,
    Body,
    UseGuards,
    Request,
    Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { RegisterDto, LoginDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import type { MemberEntity } from '@app/db';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.sub);
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Request() req, @Body() data: Partial<MemberEntity>) {
        return this.authService.updateProfile(req.user.sub, data);
    }

    // GitHub 登录跳转
    @Get('github')
    @UseGuards(AuthGuard('github'))
    async githubLogin() {
        // 自动重定向到 GitHub
    }

    // GitHub 回调
    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubCallback(@Request() req, @Res() res: any) {
        const { token, user } = req.user;

        // 重定向回前端页面，并带上 token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321';
        const redirectUrl = `${frontendUrl}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;

        return res.redirect(redirectUrl);
    }

    // WeChat 登录跳转
    @Get('wechat')
    @UseGuards(AuthGuard('wechat'))
    async wechatLogin() {
        // 自动重定向到微信扫码页
    }

    // WeChat 回调
    @Get('wechat/callback')
    @UseGuards(AuthGuard('wechat'))
    async wechatCallback(@Request() req, @Res() res: any) {
        const { token, user } = req.user;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321';
        const redirectUrl = `${frontendUrl}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;

        return res.redirect(redirectUrl);
    }
}
