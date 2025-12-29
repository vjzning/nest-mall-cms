import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '@app/storage';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('upload')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LogInterceptor)
export class UploadController {
    constructor(private readonly storageService: StorageService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @RequirePermissions('cms:resource:upload')
    @Log({ module: '上传管理', action: '上传文件' })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any
    ) {
        return this.storageService.upload(file, req.user);
    }
}
