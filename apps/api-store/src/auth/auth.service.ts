import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from '@app/db';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

export interface RegisterDto {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  nickname?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
    private readonly jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    // Check if username already exists
    const existingUser = await this.memberRepo.findOne({
      where: [
        { username: dto.username },
        ...(dto.email ? [{ email: dto.email }] : []),
        ...(dto.phone ? [{ phone: dto.phone }] : []),
      ],
    });

    if (existingUser) {
      if (existingUser.username === dto.username) {
        throw new ConflictException('用户名已存在');
      }
      if (dto.email && existingUser.email === dto.email) {
        throw new ConflictException('邮箱已被注册');
      }
      if (dto.phone && existingUser.phone === dto.phone) {
        throw new ConflictException('手机号已被注册');
      }
    }

    // Create new member
    const member = this.memberRepo.create({
      username: dto.username,
      password: dto.password, // Will be hashed by @BeforeInsert
      email: dto.email,
      phone: dto.phone,
      nickname: dto.nickname || dto.username,
      status: 1,
    });

    const savedMember = await this.memberRepo.save(member);

    // Generate JWT token
    const token = this.generateToken(savedMember);

    return {
      token,
      user: this.sanitizeUser(savedMember),
    };
  }

  async login(dto: LoginDto) {
    // Find user by username
    const member = await this.memberRepo.findOne({
      where: { username: dto.username },
    });

    if (!member) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // Check if user is active
    if (member.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, member.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // Generate JWT token
    const token = this.generateToken(member);

    return {
      token,
      user: this.sanitizeUser(member),
    };
  }

  async getProfile(userId: number) {
    const member = await this.memberRepo.findOne({
      where: { id: userId },
    });

    if (!member) {
      throw new UnauthorizedException('用户不存在');
    }

    return this.sanitizeUser(member);
  }

  async updateProfile(userId: number, data: Partial<MemberEntity>) {
    // Remove sensitive fields
    delete data.password;
    delete data.username;
    delete (data as any).id;

    await this.memberRepo.update(userId, data);
    return this.getProfile(userId);
  }

  private generateToken(member: MemberEntity): string {
    const payload = {
      sub: member.id,
      username: member.username,
      type: 'member',
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(member: MemberEntity) {
    const { password, ...user } = member;
    return user;
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('无效的令牌');
    }
  }
}
