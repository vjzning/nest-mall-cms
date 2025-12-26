import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MemberEntity } from './member.entity';

@Entity('mall_member_auth')
@Index(['provider', 'providerId'], { unique: true })
export class MemberAuthEntity extends BaseEntity {
    @Column({ name: 'member_id', type: 'bigint' })
    memberId: number;

    @ManyToOne(() => MemberEntity)
    @JoinColumn({ name: 'member_id' })
    member: MemberEntity;

    @Column({ length: 20 })
    provider: string; // 'wechat', 'github', 'google', etc.

    @Column({ name: 'provider_id', length: 100 })
    providerId: string; // openid, github user id, etc.

    @Column({ length: 100, nullable: true })
    unionid: string; // For WeChat cross-app identification

    @Column({ length: 50, nullable: true })
    nickname: string;

    @Column({ length: 255, nullable: true })
    avatar: string;

    @Column({ type: 'json', nullable: true })
    metadata: any;
}
