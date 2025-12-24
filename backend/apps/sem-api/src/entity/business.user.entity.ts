import { Column, Entity, Unique } from 'typeorm';
import { Base } from './base';

@Entity('business_user')
@Unique('bus_user_id unique', ['businessUserId', 'projectId'])
export class BusinessBaseUserEntity extends Base {
  @Column('integer', {
    name: 'bus_user_id',
    comment: '业务用户ID',
  })
  businessUserId;
  @Column('simple-json', {
    name: 'ext_attr',
    comment: '自定义扩展属性',
    default: null,
  })
  extAttr?: any;

  @Column('varchar')
  avatar?: string;
  @Column('varchar')
  nickname?: string;
}
