import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MemberEntity } from '@app/db/entities/member.entity';
import { MemberQueryDto, UpdateMemberDto } from './dto/member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private memberRepo: Repository<MemberEntity>,
  ) {}

  async findAll(query: MemberQueryDto) {
    const { keyword, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== undefined) {
      where.status = status;
    }

    if (keyword) {
      where.username = Like(`%${keyword}%`);
      // Alternatively, use an array of conditions for OR
      // where: [
      //   { ...where, username: Like(`%${keyword}%`) },
      //   { ...where, nickname: Like(`%${keyword}%`) },
      //   { ...where, phone: Like(`%${keyword}%`) },
      // ]
    }

    const [items, total] = await this.memberRepo.findAndCount({
      where: keyword ? [
        { ...where, username: Like(`%${keyword}%`) },
        { ...where, nickname: Like(`%${keyword}%`) },
        { ...where, phone: Like(`%${keyword}%`) },
      ] : where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.memberRepo.findOne({ where: { id } });
  }

  async update(id: number, updateDto: UpdateMemberDto) {
    await this.memberRepo.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.memberRepo.delete(id);
    return { success: true };
  }
}
