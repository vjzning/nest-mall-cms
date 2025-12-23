import { Column, Entity, Index } from 'typeorm';
import { YesOrNo } from '../common/enum';
import { Base } from './base';
@Entity('app_access_token')
export class AccessTokenEntity extends Base {
  @Column({
    type: 'varchar',
    length: '20',
    name: 'app_id',
  })
  @Index('app_id', {
    unique: true,
  })
  appId?: string;
  @Column({
    type: 'varchar',
    length: '20',
    name: 'app_name',
  })
  appName?: string;
  @Column({
    type: 'varchar',
    length: '32',
    name: 'app_secret',
  })
  @Index('app_secret', {
    unique: true,
  })
  appSecret?: string;
  @Column({
    type: 'enum',
    name: 'app_flag',
    enum: YesOrNo,
    default: YesOrNo.Yes,
  })
  isFlag?: string;
  @Column({
    name: 'redirect_url',
  })
  redirectUrl?: string;
}
