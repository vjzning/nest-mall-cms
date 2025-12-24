import { Column, Entity, Unique } from 'typeorm';
import { Base } from './base';
@Entity('out_user')
@Unique(['appId', 'busUserId'])
export class OutUserEntity extends Base {
  @Column({
    name: 'bus_user_id',
    comment: '业务用户 ID',
  })
  busUserId: string;
  @Column({
    name: 'app_id',
    comment: '应用 ID',
  })
  appId: string;
  @Column()
  nickname: string;
  @Column()
  avatar: string;
  @Column({
    name: 'user_type',
    comment: '用户类型',
  })
  userType: number;
  @Column({
    name: 'openid',
    length: 32,
    unique: true,
  })
  openid?: string;
}
