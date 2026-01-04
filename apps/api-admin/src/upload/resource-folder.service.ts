import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ResourceFolderEntity } from '@app/db/entities/resource-folder.entity';
import {
    CreateResourceFolderDto,
    UpdateResourceFolderDto,
} from './dto/resource-folder.dto';

@Injectable()
export class ResourceFolderService {
    constructor(
        @InjectRepository(ResourceFolderEntity)
        private readonly folderRepo: Repository<ResourceFolderEntity>
    ) {}

    async findAll(parentId?: number) {
        return this.folderRepo.find({
            where: { parentId: parentId ? parentId : IsNull() },
            order: { sort: 'ASC', createdAt: 'DESC' },
        });
    }

    async findOne(id: number) {
        const folder = await this.folderRepo.findOne({
            where: { id },
            relations: ['parent', 'children', 'resources'],
        });
        if (!folder) {
            throw new NotFoundException(`Folder #${id} not found`);
        }
        return folder;
    }

    async create(dto: CreateResourceFolderDto) {
        if (dto.parentId) {
            await this.findOne(dto.parentId);
        }
        const folder = this.folderRepo.create(dto);
        return this.folderRepo.save(folder);
    }

    async update(id: number, dto: UpdateResourceFolderDto) {
        await this.findOne(id);
        if (dto.parentId) {
            if (dto.parentId === id) {
                throw new Error('父目录不能是自己');
            }
            await this.findOne(dto.parentId);
        }
        await this.folderRepo.update(id, dto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const folder = await this.findOne(id);
        if (folder.children?.length > 0) {
            throw new Error('请先删除子目录');
        }
        if (folder.resources?.length > 0) {
            throw new Error('请先删除或移动该目录下的资源');
        }
        return this.folderRepo.remove(folder);
    }
}
