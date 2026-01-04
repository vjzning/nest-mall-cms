import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    Request,
    Body,
    Query,
    Get,
    Patch,
    Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '@app/storage';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceEntity } from '@app/db';
import { IsNull, Repository } from 'typeorm';

@Controller('upload')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LogInterceptor)
export class UploadController {
    constructor(
        private readonly storageService: StorageService,
        @InjectRepository(ResourceEntity)
        private readonly resourceRepo: Repository<ResourceEntity>
    ) {}

    @Get()
    @RequirePermissions('cms:resource:list')
    async findAll(@Query('folderId') folderId?: string) {
        return this.resourceRepo.find({
            where: { folderId: folderId ? +folderId : IsNull() },
            order: { createdAt: 'DESC' },
            relations: ['uploader'],
        });
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @RequirePermissions('cms:resource:upload')
    @Log({ module: '上传管理', action: '上传文件' })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
        @Body('folderId') folderId?: string
    ) {
        return this.storageService.upload(
            file,
            req.user,
            folderId ? +folderId : undefined
        );
    }

    @Patch(':id/move')
    @RequirePermissions('cms:resource:update')
    @Log({ module: '上传管理', action: '移动资源' })
    async moveResource(
        @Param('id') id: string,
        @Body('folderId') folderId?: number
    ) {
        await this.resourceRepo.update(id, {
            folderId: folderId ? folderId : (null as any),
        });
        return { success: true };
    }
}
