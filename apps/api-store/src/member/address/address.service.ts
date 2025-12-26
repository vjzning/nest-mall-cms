import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberAddressEntity } from '@app/db';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressService {
    constructor(
        @InjectRepository(MemberAddressEntity)
        private readonly addressRepository: Repository<MemberAddressEntity>
    ) {}

    async findAll(memberId: number): Promise<MemberAddressEntity[]> {
        return this.addressRepository.find({
            where: { memberId },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }

    async findOne(id: number, memberId: number): Promise<MemberAddressEntity> {
        const address = await this.addressRepository.findOne({ where: { id } });
        if (!address) {
            throw new NotFoundException('收货地址不存在');
        }

        // 兼容 string 和 number 的比较，bigint 在 JS 中可能被识别为 string
        if (String(address.memberId) !== String(memberId)) {
            throw new ForbiddenException('您没有权限访问此地址');
        }
        return address;
    }

    async create(
        memberId: number,
        dto: CreateAddressDto
    ): Promise<MemberAddressEntity> {
        if (dto.isDefault === 1) {
            await this.resetDefault(memberId);
        }
        const address = this.addressRepository.create({
            ...dto,
            memberId,
        });
        return this.addressRepository.save(address);
    }

    async update(
        id: number,
        memberId: number,
        dto: UpdateAddressDto
    ): Promise<MemberAddressEntity> {
        const address = await this.findOne(id, memberId);

        if (dto.isDefault === 1 && address.isDefault !== 1) {
            await this.resetDefault(memberId);
        }

        Object.assign(address, dto);
        return this.addressRepository.save(address);
    }

    async remove(id: number, memberId: number): Promise<void> {
        const address = await this.findOne(id, memberId);
        await this.addressRepository.remove(address);
    }

    async setDefault(
        id: number,
        memberId: number
    ): Promise<MemberAddressEntity> {
        try {
            console.log(
                `Setting default address: id=${id}, memberId=${memberId}`
            );
            const address = await this.findOne(id, memberId);
            await this.resetDefault(memberId);
            address.isDefault = 1;
            const saved = await this.addressRepository.save(address);
            console.log(`Default address set successfully: id=${id}`);
            return saved;
        } catch (error) {
            console.error('Failed to set default address:', error);
            throw error;
        }
    }

    private async resetDefault(memberId: number): Promise<void> {
        // 使用 queryBuilder 确保 bigint 处理正确
        // 注意：在 .set() 中通常使用属性名，但在 .where() 中如果是字符串，建议检查实体映射
        await this.addressRepository
            .createQueryBuilder()
            .update(MemberAddressEntity)
            .set({ isDefault: 0 })
            .where('memberId = :memberId', { memberId })
            .andWhere('isDefault = 1')
            .execute();
    }
}
