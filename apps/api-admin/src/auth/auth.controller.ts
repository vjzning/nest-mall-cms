import {
    Controller,
    Post,
    Body,
    UnauthorizedException,
    Get,
    Request,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../common/decorators/auth.decorator';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('auth')
@UseInterceptors(LogInterceptor)
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService
    ) {}

    @Public()
    @Post('login')
    @Log({ module: '认证管理', action: '登录' })
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(
            loginDto.username,
            loginDto.password
        );
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Public()
    @Post('register')
    @Log({ module: '认证管理', action: '注册' })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
