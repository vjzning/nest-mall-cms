import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity, MemberAuthEntity } from '@app/db';
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
        @InjectRepository(MemberAuthEntity)
        private readonly memberAuthRepo: Repository<MemberAuthEntity>,
        private readonly jwtService: JwtService
    ) {}

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
        const isPasswordValid = await bcrypt.compare(
            dto.password,
            member.password
        );
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

    /**
     * 处理 OAuth 登录逻辑
     * @param provider 平台名称 (github, wechat等)
     * @param profile 第三方用户信息
     */
    async oauthLogin(provider: string, profile: any) {
        const {
            id: providerId,
            nickname,
            avatar,
            email,
            unionid,
            ...metadata
        } = profile;

        // 1. 查找是否已经绑定过
        let auth = await this.memberAuthRepo.findOne({
            where: { provider, providerId },
            relations: ['member'],
        });

        if (auth && auth.member) {
            // 已绑定，直接返回 token
            const token = this.generateToken(auth.member);
            return {
                token,
                user: this.sanitizeUser(auth.member),
            };
        }

        // 2. 未绑定，尝试通过 email 关联或创建新用户
        let member: MemberEntity | null = null;
        if (email) {
            member = await this.memberRepo.findOne({ where: { email } });
        }

        if (!member) {
            // 创建新用户
            const newMember = this.memberRepo.create({
                username: `${provider}_${providerId}`,
                nickname: nickname || `${provider}_user`,
                avatar: avatar,
                email: email,
                status: 1,
            });
            member = await this.memberRepo.save(newMember);
        }

        // 3. 创建绑定关系
        if (!auth) {
            auth = this.memberAuthRepo.create({
                memberId: member.id,
                provider,
                providerId,
                unionid,
                nickname,
                avatar,
                metadata,
            });
        } else {
            // 如果 auth 存在但没有关联 member (异常情况)，修复它
            auth.memberId = member.id;
            auth.unionid = unionid;
        }
        await this.memberAuthRepo.save(auth);

        const token = this.generateToken(member);
        return {
            token,
            user: this.sanitizeUser(member),
        };
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
