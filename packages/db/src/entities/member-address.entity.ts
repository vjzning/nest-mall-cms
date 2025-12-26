import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MemberEntity } from './member.entity';

@Entity('mall_member_address')
export class MemberAddressEntity extends BaseEntity {
  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @Column({ name: 'receiver_name', length: 100 })
  receiverName: string;

  @Column({ name: 'receiver_phone', length: 50 })
  receiverPhone: string;

  @Column({ name: 'country_code', length: 10, comment: 'ISO 3166-1 alpha-2' })
  countryCode: string;

  @Column({ name: 'country_name', length: 100, nullable: true })
  countryName: string;

  @Column({ name: 'state_province', length: 100, nullable: true })
  stateProvince: string;

  @Column({ name: 'city', length: 100, nullable: true })
  city: string;

  @Column({ name: 'district_county', length: 100, nullable: true })
  districtCounty: string;

  @Column({ name: 'address_line1', length: 255 })
  addressLine1: string;

  @Column({ name: 'address_line2', length: 255, nullable: true })
  addressLine2: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode: string;

  @Column({ name: 'is_default', type: 'tinyint', default: 0 })
  isDefault: number;

  @Column({ name: 'tag', length: 20, nullable: true, comment: 'Home, Office, etc.' })
  tag: string;
}
